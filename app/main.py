from ast import keyword
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()
# Jinja2Template사용
# 이거는 뺴면 빼면 될듯
templates = Jinja2Templates(directory=str(BASE_DIR/"templates"))


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title":"Kloud"})



