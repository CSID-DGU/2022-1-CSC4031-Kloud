import botocore.exceptions
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from .response_exceptions import UserNotInDBException
from . import common_functions
from .auth import create_access_token, get_user_id
import boto3
import asyncio
import concurrent.futures
from .config.cellery_app import da_app

# BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
aws_info = boto3.Session()

clients = dict()  # 수정 필요
event_loop = None  # on_event('startup')시 오버라이드
executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)  # boto3 io 작업이 실행될 스레드풀. KloudClient 객체 생성시 넘어감.


@app.on_event('startup')
async def startup():
    global event_loop
    event_loop = asyncio.get_running_loop()  # KloudClient 객체 생성시 넘어감.


def get_user_client(user_id: str = Depends(get_user_id)) -> KloudClient:  # 수정 필요
    try:
        return clients[user_id]
    except KeyError:
        raise UserNotInDBException


def add_user_client(user_id: str,
                    user_client: KloudClient) -> None:  # todo 현재 KloudClient 객체를 딕셔너리에 저장함. 추후 변동 가능
    clients[user_id] = user_client


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


@app.post("/login")
def login(login_form: KloudLoginForm):  # todo token revoke 목록 확인, refresh token
    try:
        session_instance: boto3.Session = boto3.Session(aws_access_key_id=login_form.access_key_public,
                                                        aws_secret_access_key=login_form.access_key_secret,
                                                        region_name=login_form.region)
        if common_functions.is_valid_session(session_instance):  # todo 스레드풀에서 실행
            kloud_client = KloudClient(access_key_id=login_form.access_key_public,
                                       session_instance=session_instance,
                                       loop=event_loop,
                                       executor=executor)
            add_user_client(login_form.access_key_public, kloud_client)
            token = create_access_token(login_form.access_key_public)
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


class Test(BaseModel):
    a: int
    b: int


@app.post("/test")
async def test(data: Test):
    task_id = da_app.send_task('add', (data.a, data.b)).id
    return task_id


@app.post("/cost/trend/similarity")
async def pattern_finder(user_client=Depends(get_user_client)):
    data = await user_client.get_default_cost_history()
    task = da_app.send_task("/cost/trend/similarity", [data])
    return task.id


@app.post("/cost/trend/prophet")
async def pattern_finder2(user_client=Depends(get_user_client)):
    data = await user_client.get_default_cost_history()
    task = da_app.send_task("/cost/trend/prophet", [data])
    return task.id


@app.get("/res/{job_id}")
async def check(job_id):
    return da_app.AsyncResult(job_id).result

