import asyncio

import boto3
import botocore.exceptions
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..auth import async_request_temp_cred, create_access_token, security, revoke_token
from ..dependencies import get_user_id
from ..redis_req import set_cred_to_redis, delete_cred_from_redis, delete_cache_from_redis

router = APIRouter(prefix="", tags=["default"])


@router.get("/")
async def health_check():
    return 'healthy_as_hell'


class KloudLoginForm(BaseModel):
    access_key_public: str
    access_key_secret: str
    region: str


class AccessTokenResponse(BaseModel):
    access_token: str


@router.post("/login", response_model=AccessTokenResponse)
async def login(login_form: KloudLoginForm):
    try:
        session_instance: boto3.Session = boto3.Session(aws_access_key_id=login_form.access_key_public,
                                                        aws_secret_access_key=login_form.access_key_secret,
                                                        region_name=login_form.region)
        temp_cred = await async_request_temp_cred(session_instance, login_form.region)

        await set_cred_to_redis(user_id=login_form.access_key_public, cred=temp_cred)  # await 하지 않을시 잠재적 에러 가능성
        token = create_access_token(login_form.access_key_public)
        return {"access_token": token}

    except botocore.exceptions.ClientError:
        raise HTTPException(status_code=401, detail="login_failed")

    except botocore.exceptions.InvalidRegionError:
        raise HTTPException(status_code=400, detail="invalid_region")


@router.post("/logout")
async def logout(user_id=Depends(get_user_id), token=Depends(security)):
    asyncio.create_task(revoke_token(token.credentials))  # 서버에서 발급한 jwt 무효화
    asyncio.create_task(delete_cred_from_redis(user_id))  # 서버에 저장된 aws sts 토큰 삭제
    asyncio.create_task(delete_cache_from_redis(user_id))  # 캐시 제거
    return 'logout success'


@router.get("/available-regions")  # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2를 기본값으로 요청.
async def get_available_regions():
    s = boto3.Session(region_name="ap-northeast-2")
    return await asyncio.to_thread(s.get_available_regions, service_name="ec2")
