from pwdlib import PasswordHash


# 密码哈希上下文，使用bcrypt算法
pwd_context = PasswordHash.recommended()


def get_password_hash(password: str) -> str:
    """使用bcrypt算法对密码进行安全哈希处理"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码与bcrypt哈希密码是否匹配"""
    return pwd_context.verify(plain_password, hashed_password)
