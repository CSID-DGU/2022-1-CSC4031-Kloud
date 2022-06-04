import asyncio

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..boto3_wrappers.kloud_client import KloudClient
from ..dependencies import get_user_client

router = APIRouter(prefix="/mod", tags=["mod"])


class InstanceStop(BaseModel):
    instance_id: str
    hibernate: bool
    force: bool


@router.post("/mod/instance/stop")
async def stop_instance(req_body: InstanceStop, user_client: KloudClient = Depends(get_user_client)):
    coro = asyncio.to_thread(user_client.stop_instance,
                             instance_id=req_body.instance_id,
                             hibernate=req_body.hibernate,
                             force=req_body.force)
    asyncio.create_task(coro)
    return 'request sent'


class InstanceStart(BaseModel):
    instance_id: str


@router.post("/mod/instance/start")
async def start_instance(req_body: InstanceStart, user_client: KloudClient = Depends(get_user_client)):
    coro = asyncio.to_thread(user_client.start_instance, instance_id=req_body.instance_id)
    asyncio.create_task(coro)
    return 'request sent'
