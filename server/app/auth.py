from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
from .response_exceptions import CredentialsException
from .config.token_conf import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel
from fastapi import Depends


def build_token(user_id: str) -> dict:
    return {
        "user_id": user_id
    }


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = build_token(user_id=user_id)
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)  # config 참조
    to_encode.update({"exp": expire})  # 토큰 유효기간
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt  # 인코딩된 jwt 반환


class AccessTokenForm(BaseModel):
    access_token: str


async def validate_and_decode_access_token(access_token_form: AccessTokenForm) -> dict:
    try:
        payload = jwt.decode(access_token_form.access_token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise CredentialsException
    return payload


async def get_user_id(payload: dict = Depends(validate_and_decode_access_token)) -> str:
    """
    토큰에서 유저 id를 가져옴. 토큰이 유효하지 않을 경우 에러 raise
    """
    try:
        user_id: str = payload['user_id']
    except KeyError:
        raise CredentialsException
    return user_id
