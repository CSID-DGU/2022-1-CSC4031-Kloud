import botocore.exceptions
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .client import KloudClient
from .response_exceptions import UserNotInDBException
from pathlib import Path
from . import common_functions
from .auth import create_access_token, get_user_id
from .models.PatternFinder import PatternFinder
from datetime import datetime, timedelta
from app.models.ProPhetPatternFinder import ProPhetPatternFinder
import boto3
import asyncio
import concurrent.futures

BASE_DIR = Path(__file__).resolve().parent

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


async def add_user_client(user_id: str,
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
async def login(login_form: KloudLoginForm):  # todo token revoke 목록 확인, refresh token
    try:
        session_instance: boto3.Session = common_functions.create_session(access_key_id=login_form.access_key_public,
                                                                          secret_access_key=login_form.access_key_secret,
                                                                          region=login_form.region)
        if await common_functions.is_valid_session(session_instance):  # todo 스레드풀에서 실행
            kloud_client = KloudClient(access_key_id=login_form.access_key_public,
                                       session_instance=session_instance,
                                       loop=event_loop,
                                       executor=executor)
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
def cost_history_default(user_client=Depends(get_user_client)):
    return user_client.get_default_cost_history()


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


@app.post("/cost/trend/similarity")
def pattern_finder(user_client=Depends(get_user_client)):
    data = user_client.get_default_cost_history()
    p = PatternFinder(data)
    # 날짜는 수정이 가능함 원하는 날짜가 들어오게 만들면 될 듯
    result = p.search('2022-02-02', "2022-03-20", threshold=0.5)
    # 패턴을 못찾은 경우 추후에 try,except로 수정해야할듯
    if len(result) == 0:
        print("threshold 혹은 date범위를 바꿔주어야함")
        pass
    base_norm = p.get_base_norm()
    top_norm = p.get_target_norm()
    answer = {}
    base_norm_index = base_norm.index
    for i in range(len(top_norm)):
        if i < len(base_norm):
            answer[base_norm_index[i]] = {"real_data": round(base_norm.iloc[i], 6),
                                          "expected_data": round(top_norm.iloc[i], 6)}
        else:
            temp_time = str(base_norm_index[-1]).split("-")
            time = datetime(int(temp_time[0]), int(temp_time[1]), int(temp_time[2]))
            now_time = time + timedelta(days=i - len(base_norm) + 1)
            now_time = str(now_time).split()[0]
            answer[now_time] = {"expected_data": round(top_norm.iloc[i], 6)}
    return answer


@app.post("/cost/trend/prophet")
async def pattern_finder2(user_client=Depends(get_user_client)):
    data = await user_client.get_default_cost_history()
    p = ProPhetPatternFinder(data = data)
    # 이후 5일 예측, default = 10
    periods = 5
    p.model_fit(periods = periods)
    expected_data = p.expected_data()
    real_data = p.real_data()
    answer = {}
    for i in range(len(expected_data)):
        date = str(expected_data.ds.iloc[i]).split()[0]
        expected_data
        if i < len(real_data):
            answer[date] = {"real_data": round(real_data.y.iloc[i],6), "expected_data" : {"yhat" : round(expected_data.yhat.iloc[i],6), "yhat_lower": round(expected_data.yhat_lower.iloc[i],6), "yhat_upper" : round(expected_data.yhat_upper.iloc[i],6)}}
        else:
            answer[date] = {"expected_data" : {"yhat" : round(expected_data.yhat.iloc[i],6), "yhat_lower": round(expected_data.yhat_lower.iloc[i],6), "yhat_upper" : round(expected_data.yhat_upper.iloc[i],6)}}
    return answer
