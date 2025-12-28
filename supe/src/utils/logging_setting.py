import sys
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


LOG_CONFIG = {
    "max_bytes": 1024 * 1024 * 5,
    "backup_count": 5,
    "encoding": "utf-8",
    "default_level": logging.INFO,
    "format": "%(asctime)s - %(process)d - %(thread)d - %(name)s - %(module)s - %(levelname)s - %(message)s",
    "datefmt": "%Y-%m-%d %H:%M:%S"
}


logger_container: dict[str, logging.Logger] = {}
"""全局 Logger 存储容器"""


def _setup_logger(
    logger_name: str,
    log_file: Path,
    level: int = LOG_CONFIG["default_level"]
) -> logging.Logger:
    """
    内部 Logger 初始化函数（同步）
    """
    # 避免重复创建Logger
    if logger_name in logger_container:
        return logger_container[logger_name]
    
    # 创建Logger实例
    logger = logging.getLogger(logger_name)
    logger.setLevel(level)
    logger.propagate = False  # 防止日志重复输出到根Logger
    
    # 创建格式器
    formatter = logging.Formatter(
        fmt=LOG_CONFIG["format"],
        datefmt=LOG_CONFIG["datefmt"]
    )
    
    # 1. 文件处理器（按大小轮转）
    file_handler = RotatingFileHandler(
        filename=log_file,
        maxBytes=LOG_CONFIG["max_bytes"],
        backupCount=LOG_CONFIG["backup_count"],
        encoding=LOG_CONFIG["encoding"]
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # 2. 控制台处理器（开发环境下方便调试）
    console_handler = logging.StreamHandler(
        stream=sys.stdout
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 存入容器
    logger_container[logger_name] = logger
    return logger


async def setup_base_logging() -> logging.Logger:
    """
    初始化基础 Logger
    """
    log_file = Path("configs/app_logger.log")
    log_file.touch()
    return _setup_logger("base", log_file.resolve())


async def setup_custom_logger(
    logger_name: str,
    log_file: str,
    level: int = LOG_CONFIG["default_level"]
) -> logging.Logger | None:
    """
    初始化自定义 Logger
    """
    try:
        log_file_real = Path(log_file)
        log_file_real.touch()
        logger = _setup_logger(logger_name, log_file_real, level)
        return logger
    except Exception as e:
        print(f"初始化自定义Logger失败: {str(e)}", file=sys.stderr)
        raise e


async def get_logger(logger_name: str = "base") -> logging.Logger | None:
    """
    获取指定名称的Logger实例（若未初始化则自动初始化基础 Logger）
    """
    try:
        if logger_name not in logger_container:
            # 若请求的Logger未初始化，默认初始化base Logger
            if logger_name == "base":
                return await setup_base_logging()
            else:
                # 可扩展：支持初始化其他名称的Logger
                raise ValueError(f"Logger '{logger_name}' 未配置，请先初始化")
        return logger_container[logger_name]
    except Exception as e:
        # 记录Logger获取失败的基础日志（输出到控制台）
        print(f"获取Logger失败: {str(e)}", file=sys.stderr)
        raise e


async def logger_debug(message: str, logger_name: str = "base"):
    """
    记录DEBUG级别日志
    """
    logger = await get_logger(logger_name)
    if logger:
        logger.debug(message)


async def logger_info(message: str, logger_name: str = "base"):
    """
    记录INFO级别日志
    """
    logger = await get_logger(logger_name)
    if logger:
        logger.info(message)


async def logger_warning(message: str, logger_name: str = "base"):
    """
    记录WARNING级别日志
    """
    logger = await get_logger(logger_name)
    if logger:
        logger.warning(message)


async def logger_error(message: str, logger_name: str = "base", exc_info: bool = False):
    """
    记录ERROR级别日志
    """
    logger = await get_logger(logger_name)
    if logger:
        logger.error(message, exc_info=exc_info)


async def logger_critical(message: str, logger_name: str = "base", exc_info: bool = False):
    """
    记录 CRITICAL 级别日志
    """
    logger = await get_logger(logger_name)
    if logger:
        logger.critical(message, exc_info=exc_info)



# 示例使用（测试代码）
if __name__ == "__main__":
    import asyncio

    async def test_logging():
        # 初始化基础Logger并记录日志
        await logger_info("应用启动成功")
        await logger_debug("调试信息：数据库连接池初始化完成")
        await logger_warning("警告：配置文件使用默认值")
        
        # 模拟异常日志
        try:
            1 / 0
        except ZeroDivisionError:
            await logger_error("计算错误", exc_info=True)
        
        # 初始化自定义Logger
        custom_logger = await setup_custom_logger("payment", "src/configs/payment.log")
        if custom_logger:
            await logger_info("支付模块初始化完成", logger_name="payment")
        
        await logger_critical("严重错误：数据库连接失败", exc_info=True)

    # 运行测试
    asyncio.run(test_logging())