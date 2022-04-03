import botocore.exceptions
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from .response_exceptions import UserNotInDBException
from pathlib import Path
from . import common_functions
from .auth import create_access_token, get_user_id
import boto3

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
aws_info = boto3.Session()

clients = dict()  # 수정 필요


def get_user_client(user_id: str = Depends(get_user_id)) -> KloudClient:  # 수정 필요
    try:
        return clients[user_id]
    except KeyError:
        raise UserNotInDBException


##### CORS #####
# 개발 편의를 위해 모든 origin 허용. 배포시 수정 필요

origins = [
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


##### CORS #####


class KloudLoginForm(BaseModel):
    access_key_public: str
    access_key_secret: str
    region: str


async def add_user_client(user_id: str, user_client: KloudClient) -> None:  # todo 현재 KloudClient 객체를 딕셔너리에 저장함. 추후 변동 가능
    clients[user_id] = user_client


@app.post("/login")
async def login(login_form: KloudLoginForm):  # todo token revoke 목록 확인, refresh token
    try:
        session_instance: boto3.Session = common_functions.create_session(access_key_id=login_form.access_key_public,
                                                                    secret_access_key=login_form.access_key_secret,
                                                                    region=login_form.region)
        if await common_functions.is_valid_session(session_instance):
            kloud_client = KloudClient(access_key_id=login_form.access_key_public,
                                       session_instance=session_instance)
            await add_user_client(login_form.access_key_public, kloud_client)
            token = await create_access_token(login_form.access_key_public)
            return {"access_token": token}

    except botocore.exceptions.ClientError:
        raise HTTPException(status_code=401, detail="login_failed")
    except botocore.exceptions.InvalidRegionError:
        raise HTTPException(status_code=400, detail="invalid_region")


@app.get("/available-regions")  # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2를 기본값으로 요청.
async def get_available_regions():
    return await common_functions.get_available_regions()


@app.post("/infra/info")
async def infra_info(user_client=Depends(get_user_client)):
    return await user_client.get_current_infra_dict()


@app.post("/cost/history/default")
async def cost_history_default(user_client=Depends(get_user_client)):
    return await user_client.get_default_cost_history()


@app.post("/infra/tree")
async def infra_tree(user_client=Depends(get_user_client)):
    return await user_client.get_infra_tree()


@app.post("/logout")
async def logout(user_id=Depends(get_user_id)):  # todo token revoke 목록
    try:
        clients.pop(user_id)
    except KeyError:
        pass
    finally:
        return "logout_success"
