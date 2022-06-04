from fastapi import APIRouter, Depends

from ..boto3_wrappers.kloud_client import KloudClient
from ..dependencies import get_user_client

router = APIRouter(prefix="/infra",
                   tags=["infra"])


@router.get("/info")
async def infra_info(user_client: KloudClient = Depends(get_user_client)):
    return await user_client.get_current_infra_dict()


@router.get("/tree")
async def infra_tree(user_client: KloudClient = Depends(get_user_client)):
    """
    nested json 형태로 인프라 트리 반환
    """
    return await user_client.get_infra_tree()


@router.get("/top3")
async def top3_instances_utilization_average(user_client: KloudClient = Depends(get_user_client)):
    return await user_client.get_top_3_usage_average()
