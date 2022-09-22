import asyncio

from fastapi import APIRouter, Depends

from ..auth import security
from ..boto3_wrappers.kloud_client import KloudClient
from ..config.cellery_app import da_app
from ..dependencies import get_user_id, get_user_client
from ..redis_req import get_cost_cache, set_cost_cache
from ..response_exceptions import CeleryTimeOutError
from ..scheme import CostHistory, CostHistoryByResource, CostHistoryByService, ReservationRecommendation, \
    RightSizingRecommendation, TrendProphet

router = APIRouter(prefix="/cost",
                   tags=["cost"])


@router.get("/history/param")
async def cost_history_param(user_id=Depends(get_user_id),
                             q: CostHistory = Depends()
                             ) -> dict:
    """
    HOURLY 일시 최대 14일 가능
    """
    key = f'{user_id}_{q.granularity}_{q.days}'
    cost_history = await get_cost_cache(key)
    if cost_history is None:
        user_client = await get_user_client(user_id)
        cost_history: dict = await user_client.get_cost_history(days=q.days, granularity=q.granularity)
        asyncio.create_task(set_cost_cache(key, cost_history))
    else:
        print(f'cache hit {user_id=}')
    return cost_history


@router.get("/history/default")
async def cost_history_default(user_id=Depends(get_user_id)):
    """
    deprecated
    cost_history_param 사용할것.
    """
    return await cost_history_param(user_id=user_id)


@router.get("/history/by-resource")
async def cost_history_by_resource(user_id=Depends(get_user_id),
                                   q: CostHistoryByResource = Depends()
                                   ):
    """
    specific: true|false, default false, usage type and quantity 나누어 세부적으로 출력
    """
    user_client = await get_user_client(user_id)
    return await user_client.get_cost_history_by_instances(show_usage_type_and_quantity=q.specific,
                                                           granularity=q.granularity)


@router.get("/history/by-service")
async def cost_history_by_service(user_client: KloudClient = Depends(get_user_client),
                                  q: CostHistoryByService = Depends()):
    return await user_client.get_cost_history_by_service(days=q.days)


@router.get("/recommendation/reservation")
async def reservation_recommendation(user_client: KloudClient = Depends(get_user_client),
                                     q: ReservationRecommendation = Depends()
                                     ) -> dict:
    return await user_client.async_get_reservation_recommendation(q.service,
                                                                  q.look_back_period,
                                                                  q.years,
                                                                  q.payment_option)


@router.get("/recommendation/rightsizing")
async def rightsizing_recommendation(user_client: KloudClient = Depends(get_user_client),
                                     q: RightSizingRecommendation = Depends()):
    return await user_client.async_get_rightsizing_recommendation(
        within_same_instance_family=q.within_same_instance_family,
        benefits_considered=q.benefits_considered)


LOOP_BREAKING_STATE = {'SUCCESS', 'REVOKED', 'FAILURE'}


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
    while celery_task.state not in LOOP_BREAKING_STATE:
        await asyncio.sleep(interval)
        time_passed += interval
        if time_passed >= timeout:
            celery_task.forget()  # forget() 혹은 get() 하지 않으면 메모리 누수 가능성 있음.
            da_app.control.revoke(celery_task.id)
            raise CeleryTimeOutError
    return celery_task.get()


@router.get("/trend/similarity")
async def pattern_finder(user_client=Depends(get_user_id), token=Depends(security)):
    task = da_app.send_task("/cost/trend/similarity", [token.credentials])
    return await wait_until_done(task)  # 비동기 실행, 결과값 체크 예시


@router.get("/trend/prophet")
async def pattern_finder2(user_client=Depends(get_user_id), token=Depends(security),
                          q: TrendProphet = Depends()
                          ):
    """
    yearly_seasonality : 연 계절성
    weekly_seasonality : 주 계절성
    daily_seasonality : 일 계절성
    changepoint_prior_scale : changepoint(trend) 의 유연성 조절
    n_changepoints : 트렌드가 변하는 changepoint 의 개수(갑작스럽게 변하는 시점의 수)
    period : 예측 일수
    """
    task = da_app.send_task("/cost/trend/prophet",
                            [token.credentials, q.yearly_seasonality, q.weekly_seasonality, q.daily_seasonality,
                             q.n_changepoints, q.period])
    return await wait_until_done(task, timeout=1000)  # 비동기 실행, 결과값 체크 예시
