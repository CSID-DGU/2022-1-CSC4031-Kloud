import botocore.exceptions
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from .response_exceptions import UserNotInDBException, CeleryTimeOutError
from . import common_functions
from .auth import create_access_token, get_user_id, request_temp_cred_async, temp_session_create, security, revoke_token
import boto3
import asyncio
import concurrent.futures
from .config.cellery_app import da_app
from .redis_req import set_cred_to_redis, get_cred_from_redis, delete_cred_from_redis, get_cost_cache, set_cost_cache, delete_cache_from_redis

app = FastAPI()
aws_info = boto3.Session()

clients = dict()  # 수정 필요
event_loop: asyncio.unix_events.SelectorEventLoop  # on_event('startup')시 오버라이드
executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)  # boto3 io 작업이 실행될 스레드풀. KloudClient 객체 생성시 넘어감.


@app.on_event('startup')
async def startup():
    global event_loop
    event_loop = asyncio.get_running_loop()  # KloudClient 객체 생성시 넘어감.


async def get_user_client(user_id: str = Depends(get_user_id)) -> KloudClient:
    """
    redis에서 임시 자격증명을 가져와 객체를 생성함.
    """
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


# #### CORS #####
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


# #### CORS #####


class KloudLoginForm(BaseModel):
    access_key_public: str
    access_key_secret: str
    region: str


class AccessTokenResponse(BaseModel):
    access_token: str


BREAK_LOOP_STATE = {'SUCCESS', 'REVOKED', 'FAILURE'}


async def wait_until_done(celery_task: da_app.AsyncResult, interval=0.3, timeout=10.0):
    """
    바람직한 방법은 아닌 것 같으나, 일단 작동은 합니다.
    asyncio.sleep(interval)로, interval(초) 만큼 이벤트 루프의 제어권을 넘깁니다.

    :param celery_task:  send_task 등으로 반환된 AsyncResult 객체
    :param interval:  결과 확인 빈도, 초 단위
    :param timeout:  초 단위
    :return: 셀러리 태스크의 return 값
    """
    time_passed = 0
    while celery_task.state not in BREAK_LOOP_STATE:
        await asyncio.sleep(interval)
        time_passed += interval
        if time_passed >= timeout:
            celery_task.forget()
            da_app.control.revoke(celery_task.id)
            raise CeleryTimeOutError
    return celery_task.get()


@app.post("/login", response_model=AccessTokenResponse)
async def login(login_form: KloudLoginForm):
    try:
        session_instance: boto3.Session = boto3.Session(aws_access_key_id=login_form.access_key_public,
                                                        aws_secret_access_key=login_form.access_key_secret,
                                                        region_name=login_form.region)
        temp_cred = await request_temp_cred_async(session_instance, login_form.region)

        await set_cred_to_redis(user_id=login_form.access_key_public, cred=temp_cred)  # await 하지 않을시 잠재적 에러 가능성
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
async def cost_history_default(user_id=Depends(get_user_id)):
    """
    만약 cost history 관련 수정이 이루어진 경우에도 redis 캐시는 남아있음. 에러 피하기 위해선 캐시 처리 필요.
    """
    cost_history = await get_cost_cache(user_id)  # 캐시 확인
    if cost_history is None:  # 캐시가 없음.
        user_client = await get_user_client(user_id)  # 캐시가 없을 때만 클라이언트 객체 생성.
        cost_history: dict = await user_client.get_default_cost_history()  # aws 에서 데이터 받아옴.
        asyncio.create_task(set_cost_cache(user_client.id, cost_history))  # 비동기 캐시
    else:
        print(f'cache hit {user_id=}')
    return cost_history


@app.get("/infra/tree")
async def infra_tree(user_client=Depends(get_user_client)):
    return await user_client.get_infra_tree()


@app.post("/logout")
async def logout(user_id=Depends(get_user_id), token=Depends(security)):
    asyncio.create_task(revoke_token(token.credentials))  # 서버에서 발급한 jwt 무효화
    asyncio.create_task(delete_cred_from_redis(user_id))  # 서버에 저장된 aws sts 토큰 삭제
    asyncio.create_task(delete_cache_from_redis(user_id))  # 캐시 제거
    return 'logout success'


@app.get("/cost/trend/similarity")
async def pattern_finder(user_client=Depends(get_user_id), token=Depends(security)):
    task = da_app.send_task("/cost/trend/similarity", [token.credentials])
    return await wait_until_done(task)  # 비동기 실행, 결과값 체크 예시


@app.get("/cost/trend/prophet")
async def pattern_finder2(user_client=Depends(get_user_id), token=Depends(security)):
    task = da_app.send_task("/cost/trend/prophet", [token.credentials])
    return await wait_until_done(task, interval=0.5)  # 비동기 실행, 결과값 체크 예시


@app.get("/res/{job_id}")
async def check(job_id):
    return da_app.AsyncResult(job_id).get()  # 예시로, blocking io를 발생시킴.
