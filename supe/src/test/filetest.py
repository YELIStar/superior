from fastapi import FastAPI, HTTPException
import asyncpg
import aiohttp
import aio_pika
from aio_pika import Message
import os
from typing import Dict, Optional

# 异步处理示例

app = FastAPI(title="电商订单异步处理")

# 全局资源：数据库连接池、RabbitMQ连接（实际项目建议用依赖注入管理）
DB_POOL: Optional[asyncpg.Pool] = None
RABBITMQ_CONN: Optional[aio_pika.Connection] = None

# 初始化/关闭全局资源


@app.on_event("startup")
async def startup():
    global DB_POOL, RABBITMQ_CONN
    # 1. 创建PostgreSQL连接池
    DB_POOL = await asyncpg.create_pool(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PWD", "123456"),
        database=os.getenv("DB_NAME", "ecommerce"),
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 5432)),
        min_size=5,
        max_size=20
    )
    # 2. 连接RabbitMQ
    RABBITMQ_CONN = await aio_pika.connect_robust(
        os.getenv("RABBITMQ_URL", "amqp://guest:guest@127.0.0.1/")
    )


@app.on_event("shutdown")
async def shutdown():
    if DB_POOL:
        await DB_POOL.close()
    if RABBITMQ_CONN:
        await RABBITMQ_CONN.close()

# 核心：异步创建订单函数


@app.post("/api/orders", response_model=Dict)
async def create_order(
    user_id: int,
    product_id: int,
    quantity: int
):
    # 1. 数据库连接：从连接池获取异步连接
    conn = await DB_POOL.acquire()
    try:
        # === 步骤1：异步验证用户是否存在 ===
        user = await conn.fetchrow(
            "SELECT id, username, status FROM users WHERE id = $1",
            user_id
        )
        if not user or user["status"] != "active":
            raise HTTPException(status_code=400, detail="用户不存在或已禁用")

        # === 步骤2：异步检查商品库存（带行锁，防止并发超卖） ===
        product = await conn.fetchrow(
            "SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE",  # FOR UPDATE加行锁
            product_id
        )
        if not product:
            raise HTTPException(status_code=400, detail="商品不存在")
        if product["stock"] < quantity:
            raise HTTPException(status_code=400, detail="商品库存不足")

        # === 步骤3：异步扣减商品库存 ===
        await conn.execute(
            "UPDATE products SET stock = stock - $1 WHERE id = $2",
            quantity, product_id
        )

        # === 步骤4：异步创建订单记录（开启数据库事务，实际可封装事务上下文） ===
        order_id = await conn.fetchval(
            """
            INSERT INTO orders (user_id, product_id, quantity, status, create_time)
            VALUES ($1, $2, $3, 'pending_payment', NOW())
            RETURNING id
            """,
            user_id, product_id, quantity
        )

        # === 步骤5：异步调用支付服务生成支付链接 ===
        async with aiohttp.ClientSession() as session:
            try:
                pay_response = await session.post(
                    os.getenv(
                        "PAY_SERVICE_URL",
                        "http://127.0.0.1:8001/api/pay/create"
                    ),
                    json={
                        "order_id": order_id,
                        "user_id": user_id,
                        # 假设product含price字段
                        "amount": product["price"] * quantity
                    },
                    timeout=aiohttp.ClientTimeout(total=10)  # 异步超时控制
                )
                pay_data = await pay_response.json()
                if not pay_response.ok:
                    raise HTTPException(
                        status_code=400,
                        detail=f"支付服务错误：{pay_data.get('msg')}"
                    )
            except aiohttp.ClientError as e:
                raise HTTPException(
                    status_code=503,
                    detail=f"支付服务不可用：{str(e)}"
                )

        # === 步骤6：异步发送订单创建通知到RabbitMQ ===
        async with RABBITMQ_CONN.channel() as channel:
            # 声明交换机（持久化）
            exchange = await channel.declare_exchange(
                "order_events",
                aio_pika.ExchangeType.DIRECT,
                durable=True
            )
            # 构造消息体（JSON序列化，实际用orjson更高效）
            msg_body = f'{{"order_id": {order_id}, "user_id": {user_id}, "status": "pending_payment"}}'.encode()
            # 发布消息（持久化）
            await exchange.publish(
                Message(body=msg_body,
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT),
                routing_key="order.created"
            )

        # === 结果返回 ===
        return {
            "order_id": order_id,
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "pay_url": pay_data.get("pay_url"),
            "status": "pending_payment"
        }

    except HTTPException:
        # 业务异常直接抛出
        raise
    except Exception as e:
        # 系统异常：回滚库存（若已扣减）
        if "product_id" in locals() and "quantity" in locals():
            await conn.execute(
                "UPDATE products SET stock = stock + $1 WHERE id = $2",
                quantity, product_id
            )
        raise HTTPException(status_code=500, detail=f"订单创建失败：{str(e)}")
    finally:
        # 释放数据库连接回连接池
        await DB_POOL.release(conn)
