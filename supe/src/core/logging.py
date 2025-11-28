import logging
from logging.handlers import RotatingFileHandler
import os


def setup_logging():
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # 文件日志
    file_handler = RotatingFileHandler(
        f"{log_dir}/app.log",
        maxBytes=1024*1024*5,  # 5MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)

    # 控制台日志
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
