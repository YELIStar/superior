import os
from pathlib import Path
from typing import Callable
from functools import wraps


def get_project_root(anchor_file: str = "pyproject.toml") -> Path:
    """
    基于锚点文件定位项目根目录
    """
    current_dir = Path(__file__).resolve().parent
    while current_dir != current_dir.parent:
        if (current_dir / anchor_file).exists():
            return current_dir
        current_dir = current_dir.parent
    
    raise FileNotFoundError(
        f"未找到项目锚点文件[{anchor_file}]，无法定位项目根目录"
    )


def ensure_working_dir(
    target_relative_path: str = "",
    anchor_file: str = "main.py"
) -> None:
    """
    相对于项目根检测并切换到指定的工作目录
    """
    project_root = get_project_root(anchor_file)
    
    target_dir = (project_root / target_relative_path).resolve()
    
    if not target_dir.is_dir():
        raise FileNotFoundError(f"目标目录不存在：{target_dir}")
    
    current_dir = Path.cwd().resolve()
    
    if current_dir != target_dir:
        os.chdir(target_dir)


def run_in_target_dir(
    target_relative_path: str = "",
    anchor_file: str = "main.py"
) -> Callable:
    """
    装饰器：确保函数在指定目录下运行
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            ensure_working_dir(target_relative_path, anchor_file)
            return func(*args, **kwargs)
        return wrapper
    return decorator
