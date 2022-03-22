from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pathlib import Path
import boto3

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

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

class LogInReq(BaseModel):
    access_key_public: str
    access_key_secret: str


@app.get("/", response_class=HTMLResponse)
async def root():
    return


@app.post("/login")
async def login(login_form: LogInReq):
    aws_session = boto3.Session(
        aws_access_key_id=login_form.access_key_public,
        aws_secret_access_key=login_form.access_key_secret,
    )
    return aws_session.get_available_services()  # 응답 예시로 이용 가능한 서비스 목록 출력


