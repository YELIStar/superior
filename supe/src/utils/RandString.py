import string
import secrets

def random_string(length) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for i in range(length))
