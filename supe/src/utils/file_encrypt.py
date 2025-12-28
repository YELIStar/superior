from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken


def generate_key(key_path: str = "configs/secret.key") -> None:
    """
    生成并保存Fernet密钥
    """
    file_path = Path(key_path)
    file_path.touch()
    key = Fernet.generate_key()
    with open(file_path, "wb") as f:
        f.write(key)
    print(f"密钥已保存至: {file_path}")


def load_key(key_path: str = "configs/secret.key") -> bytes:
    """加载Fernet密钥"""
    file_path = Path(key_path)
    file_path.touch()
    with open(file_path, "rb") as f:
        return f.read()


def encrypt_file(file_path, key: bytes) -> None:
    """
    加密文件
    """
    f = Fernet(key)
    with open(file_path, "rb") as f_in:
        data = f_in.read()
    encrypted_data = f.encrypt(data)
    with open(file_path, "wb") as f_out:
        f_out.write(encrypted_data)
    print(f"文件{file_path}加密完成")


def decrypt_file(file_path, key: bytes) -> None:
    """
    解密文件
    """
    f = Fernet(key)
    try:
        with open(file_path, "rb") as f_in:
            encrypted_data = f_in.read()
        decrypted_data = f.decrypt(encrypted_data)
        with open(file_path, "wb") as f_out:
            f_out.write(decrypted_data)
        print(f"文件{file_path}解密完成")
    except InvalidToken:
        raise ValueError("密钥错误或文件已被篡改，解密失败")


# 实战调用示例
if __name__ == "__main__":
    # 1. 首次运行生成密钥
    generate_key("src/configs/secret.key")
    # 2. 加载密钥
    key = load_key("src/configs/secret.key")
    # 3. 准备测试文件（新建config.json，写入内容如{"password": "123456"}）
    test_file = Path("src/configs/config.json")
    test_file.touch()
    with open(test_file, "w") as f:
        f.write('{"password": "123456"}')
    # 4. 加密文件
    # encrypt_file(test_file, key)
    # 5. 解密文件（注释掉加密，单独运行解密可验证）
    decrypt_file(test_file, key)
