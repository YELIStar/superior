from datetime import datetime, timedelta
from jose import jwt

# 配置项（建议放在环境变量中）
SECRET_KEY = "your-secret-key-keep-it-safe"  # 生产环境用强随机字符串
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# 生成JWT令牌
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    # 加密生成令牌
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 在/token接口中使用
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 1. 验证用户名密码（省略，需查数据库）
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 2. 生成令牌（包含用户标识、权限范围等）
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        # sub是JWT标准字段，代表用户唯一标识
        data={"sub": user["username"], "scope": form_data.scopes},
        expires_delta=access_token_expires
    )

    # 3. 返回令牌
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "scope": " ".join(form_data.scopes)  # 权限范围用空格分隔
    }
