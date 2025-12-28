from datetime import datetime, timedelta
from typing import Optional, Union

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
 
# =======================
# 1. 配置参数 (模仿 B站 安全设置)
# =======================
SECRET_KEY = "bilibili_mimic_secret_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token 过期时间

# 数据库配置 (使用 SQLite 演示)
SQLALCHEMY_DATABASE_URL = "sqlite:///./bilibili_users.db"

# =======================
# 2. 数据库模型 (SQLAlchemy)
# =======================
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # 唯一用户名/UID
    email = Column(String, unique=True, index=True)    # 绑定邮箱
    phone = Column(String, unique=True, index=True, nullable=True) # 绑定手机号
    hashed_password = Column(String)
    nickname = Column(String)  # B站昵称

Base.metadata.create_all(bind=engine)

# =======================
# 3. Pydantic 模型 (数据校验)
# =======================
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    nickname: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    nickname: str

    class Config:
        orm_mode = True

# =======================
# 4. 安全工具类 (哈希与JWT)
# =======================
pwd_context = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # 指定登录接口路由

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # 将过期时间加入 payload
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# =======================
# 5. 依赖项 (Dependency)
# =======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 核心：解析 Token 获取当前用户
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload: dict = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# =======================
# 6. API 路由实现
# =======================
app = FastAPI(title="Bilibili Mimic Auth System")

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册接口
    """
    # 检查用户名是否存在
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 检查邮箱是否存在
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 创建用户
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        nickname=user.nickname
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 标准登录接口 (模仿B站多账号登录逻辑)
    form_data.username 可能是：用户名、邮箱 或 手机号
    """
    # 1. 尝试通过用户名查找
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. 如果没找到，尝试通过邮箱查找 (B站逻辑：账号可以是邮箱)
    if not user:
        user = db.query(User).filter(User.email == form_data.username).first()
    
    # 3. 验证用户是否存在以及密码是否正确
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 4. 生成 Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # sub 字段通常存放用户的唯一标识
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    受保护的路由：获取“我的信息” (类似 B站 个人中心)
    需要 Header 携带 Authorization: Bearer <token>
    """
    return current_user

# 运行命令：
# uvicorn main:app --reload