from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
from .response_exceptions import CredentialsException
from .config.token_conf import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel


async def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


class AccessToken(BaseModel):
    access_token: str


async def get_user_id(access_token_form: AccessToken) -> str:  # 토큰에서 유저 id를 가져옴. 토큰이 유효하지 않을 경우 에러 raise
    try:
        payload = jwt.decode(access_token_form.access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise CredentialsException
    except JWTError:
        raise CredentialsException
    return user_id
