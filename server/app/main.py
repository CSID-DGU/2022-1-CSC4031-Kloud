import botocore.exceptions
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from .response_exceptions import UserNotInDBException
from . import common_functions
from .auth import create_access_token, get_user_id, request_temp_cred_async, temp_session_create
import boto3
import asyncio
import concurrent.futures
from .config.cellery_app import da_app
from .redis_req import set_cred_to_redis, get_cred_from_redis
import functools

# BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
aws_info = boto3.Session()

clients = dict()  # 수정 필요
event_loop: asyncio.unix_events._UnixSelectorEventLoop  # on_event('startup')시 오버라이드
executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)  # boto3 io 작업이 실행될 스레드풀. KloudClient 객체 생성시 넘어감.


@app.on_event('startup')
async def startup():
    global event_loop
    event_loop = asyncio.get_running_loop() # KloudClient 객체 생성시 넘어감.


async def get_user_client(user_id: str = Depends(get_user_id)) -> KloudClient:
    '''
    redis에서 임시 자격증명을 가져와 객체를 생성함.
    '''
    cred = await get_cred_from_redis(user_id)
    if cred is None:
        raise UserNotInDBException  # 없는 유저
    else:
        session_instance = temp_session_create(cred)
        kloud_client = KloudClient(user_id, session_instance, event_loop, executor)
        cache_user_client(user_id, kloud_client)
        return kloud_client


def cache_user_client(user_id: str,
                      user_client: KloudClient) -> None:  # todo 유저 객체 캐시 구현
    # clients[user_id] = user_client
    pass

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


class AccessTokenResponse(BaseModel):
    access_token: str


@app.post("/login", response_model=AccessTokenResponse)
async def login(login_form: KloudLoginForm):  # todo token revoke 목록 확인, refresh token
    try:
        session_instance: boto3.Session = boto3.Session(aws_access_key_id=login_form.access_key_public,
                                                        aws_secret_access_key=login_form.access_key_secret,
                                                        region_name=login_form.region)
        temp_cred = await request_temp_cred_async(session_instance, login_form.region)

        asyncio.create_task(set_cred_to_redis(user_id=login_form.access_key_public, cred=temp_cred))
        token = create_access_token(login_form.access_key_public)
        return {"access_token": token}

    except botocore.exceptions.ClientError:
        raise HTTPException(status_code=401, detail="login_failed")

    except botocore.exceptions.InvalidRegionError:
        raise HTTPException(status_code=400, detail="invalid_region")


@app.get("/available-regions")  # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2를 기본값으로 요청.
async def get_available_regions():
    return await common_functions.get_available_regions()


@app.get("/infra/info")
async def infra_info(user_client=Depends(get_user_client)):
    return await user_client.get_current_infra_dict()


@app.get("/cost/history/default")
async def cost_history_default(user_client=Depends(get_user_client)):
    return await user_client.get_default_cost_history()


@app.get("/infra/tree")
async def infra_tree(user_client=Depends(get_user_client)):
    return await user_client.get_infra_tree()


@app.post("/logout")
async def logout(user_id=Depends(get_user_id)):  # todo token revoke 목록
    pass
    # try:
    #     clients.pop(user_id)
    # except KeyError:
    #     pass
    # finally:
    #     return "logout_success"


@app.get("/cost/trend/similarity")
async def pattern_finder(user_client=Depends(get_user_client)):
    data = await user_client.get_default_cost_history()
    task = da_app.send_task("/cost/trend/similarity", [data])
    return task.id


@app.get("/cost/trend/prophet")
async def pattern_finder2(user_client=Depends(get_user_client)):
    data = await user_client.get_default_cost_history()
    task = da_app.send_task("/cost/trend/prophet", [data])
    return task.id


@app.get("/res/{job_id}")
async def check(job_id):
    return da_app.AsyncResult(job_id).result
