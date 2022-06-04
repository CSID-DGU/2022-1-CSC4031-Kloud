import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import root, cost, infra, mod

TITLE = "Kloud API"
CONTACT = {
    "name": "Team Kloud",
    "url": "https://github.com/CSID-DGU/2022-1-CSC4031-Kloud"
}

app = FastAPI(title=TITLE, contact=CONTACT)

# CORS
# 개발 편의를 위해 모든 origin 허용. 배포시 수정 필요
origins = ["*"]
if os.environ.get('IS_PRODUCTION') == "true":  # 배포 환경 origins 수정
    origins = [os.environ.get('FRONT_END_URL'),  # https://something.com
               os.environ.get('API_URL')]  # https://api.something.com

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Routers
app.include_router(root.router)
app.include_router(infra.router)
app.include_router(cost.router)
app.include_router(mod.router)
