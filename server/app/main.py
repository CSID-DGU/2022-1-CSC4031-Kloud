import botocore.exceptions
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from pathlib import Path
from . import sdk_handle
import boto3

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
aws_info = boto3.Session()

##### CORS #####
# 개발 편의를 위해 모든 origin 허용. 배포시 수정 필요

clients = dict()

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

class LogInReq(BaseModel):  # todo region 입력할 필요 없이 백엔드에서 모든 리전 조회 후, 인프라가 돌아가는 리전들 따로 반환
    access_key_public: str
    access_key_secret: str
    region: str


@app.post("/login")
async def login(login_form: LogInReq):
    try:
        session_instance: boto3.Session = sdk_handle.create_session(access_key_id=login_form.access_key_public,
                                                                    secret_access_key=login_form.access_key_secret,
                                                                    region=login_form.region)
        if await sdk_handle.is_valid_session(session_instance):
            kloud_client = KloudClient(access_key_id=login_form.access_key_public,
                                       session_instance=session_instance)
            clients[login_form.access_key_public] = kloud_client  # todo 현재 KloudClient 객체를 딕셔너리에 저장함. 추후 변동 가능
            return "login_success"
    except botocore.exceptions.ClientError:
        raise HTTPException(status_code=401, detail="login_failed")  # todo 추후 상세한 에러 내용 담아서 수정


@app.get("/available_regions")  # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2를 기본값으로 요청.
async def get_available_regions():
    return await sdk_handle.get_available_regions()


class InfraInfoReq(BaseModel):  # 보안 확인
    id: str


@app.post("/infra_info")
async def infra_info(req: InfraInfoReq):
    try:
        client: KloudClient = clients[req.id]
    except KeyError:
        raise HTTPException(status_code=404, detail="kloud_client_not_found")
    return await client.get_current_infra_dict()

