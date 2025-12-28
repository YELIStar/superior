import re
from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr, field_validator, model_validator, BaseModel, Field

import models.User as UserModel


class UserLogin(BaseModel):
    """
    用户登录表单
    """
    phone: str = Field(
        min_length=11,
        max_length=11,
    )
    password: str = Field(
        min_length=8,
        max_length=32
    )
    
class UserRegister(BaseModel):
    """
    用户注册表单
    """
    phone: str = Field(
        min_length=11,
        max_length=11
    )
    password: str = Field(
        min_length=8,
        max_length=32
    )
    confirm_password: str = Field(  
        min_length=8,
        max_length=32
    )
    
    @field_validator('phone')
    def phone_must_be_digits(cls, v):
        """手机号码格式校验"""
        if v is not None and not re.match(r'^1[3-9]\d{11}$', v):
            raise ValueError('手机号码格式错误')
        return v
    
    @model_validator(mode="after") # type: ignore
    def password_to_match(self):
        if self.password != self.confirm_password:
            raise ValueError('密码和确认密码不匹配')
        return self


class UserUpdate(BaseModel):
    """
    用户更新表单
    """
    phone: str | None = Field(
        min_length=11,
    )
    
    nickname: str | None = Field(
        min_length=2,
        max_length=32
    )
    
    user_status: UserModel.user_status_enum
    
    email: EmailStr | None
    
    gender: UserModel.gender_enum | None
    
    birthday: datetime | None
    
    signature: str | None = Field(
        max_length=255
    )
    
    avatar_url: str | None = Field(
        max_length=255
    )
    
    province: str | None = Field(
        max_length=32
    )
    
    city: str | None = Field(
        max_length=32
    )
    

class UserPasswordUpdate(BaseModel):
    """
    用户密码更新表单
    """
    old_password: str = Field(
        min_length=8,
        max_length=32
    )
    new_password: str = Field(
        min_length=8,
        max_length=32
    )
    confirm_password: str = Field(
        min_length=8,
        max_length=32
    )
    
    @model_validator(mode="after") # type: ignore
    def new_passwords_to_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError('新密码和确认密码不匹配')
        return self


class UserProfileResponse(BaseModel):
    """
    用户资料响应模型
    """
    email: str | None
    nickname: str | None
    gender: int
    birthday: datetime | None
    signature: str | None
    province: str | None
    city: str | None
    avatar_url: str | None


class UserResponse(BaseModel):
    """
    用户响应模型
    """
    user_id: int
    phone: str
    user_status: int
    last_login_at: datetime
    create_at: datetime
    profile: UserProfileResponse | None
    model_config = {
        "from_attributes": True
    }
    
class UserTokenResponse(BaseModel):
    """
    用户令牌响应模型
    """
    access_token: str = Field(
        alias="accessToken"
    )
    token_type: Literal["bearer"] = Field(
        default="bearer"
    )
    expire_in: int
    scope: str | None = Field(
        default=""
    )
    
    model_config = ConfigDict(
        frozen=True
    )
    
