import functools
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
from .response_exceptions import CredentialsException
from .config.token_conf import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from .redis_req import add_revoked_redis, is_member_revoked_redis
from pydantic import BaseModel
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import boto3
import asyncio

security = HTTPBearer(scheme_name='bearer')


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


async def revoke_token(token: str) -> None:
    await add_revoked_redis(token)


async def is_revoked(token: str) -> bool:
    return await is_member_revoked_redis(token)


class AccessTokenForm(BaseModel):
    access_token: str


def request_temp_cred(session_obj: boto3.Session, region: str) -> dict:
    """
    return
    {
    'AccessKeyId': 'some-id',
    'SecretAccessKey': 'some-secret',
    'SessionToken': 'some-token',
    'region': 'some-region'
    }
    """
    sts_cli = session_obj.client('sts')  # 임시 토큰 발급
    response = sts_cli.get_session_token()
    cred = response['Credentials']
    cred['region'] = region
    cred.pop('Expiration')  # datetime.datetime json serialize 불가
    return cred


async def request_temp_cred_async(session_obj: boto3.Session, region: str) -> dict:
    fun = functools.partial(request_temp_cred, session_obj=session_obj, region=region)
    return await asyncio.to_thread(fun)


def temp_session_create(cred: dict) -> boto3.Session:
    return boto3.Session(aws_access_key_id=cred['AccessKeyId'],
                         aws_secret_access_key=cred['SecretAccessKey'],
                         aws_session_token=cred['SessionToken'],
                         region_name=cred['region'])


async def validate_and_decode_access_token(auth_header: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(auth_header.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if await is_member_revoked_redis(auth_header.credentials):  # token revoke 여부 확인
            raise CredentialsException
    except JWTError:
        raise CredentialsException
    return payload


async def get_user_id(decoded: dict = Depends(validate_and_decode_access_token)) -> str:
    """
    토큰에서 유저 id를 가져옴. 토큰이 유효하지 않을 경우 에러 raise
    """
    try:
        user_id: str = decoded['user_id']
    except KeyError:
        raise CredentialsException
    return user_id

