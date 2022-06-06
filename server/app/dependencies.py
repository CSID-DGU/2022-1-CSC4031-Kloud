from fastapi import Depends

from .auth import validate_and_decode_access_token, create_temp_session
from .boto3_wrappers.kloud_client import KloudClient
from .redis_req import get_cred_from_redis
from .response_exceptions import CredentialsException, UserNotInDBException


async def get_user_id(decoded: dict = Depends(validate_and_decode_access_token)) -> str:
    """
    토큰에서 유저 id를 가져옴. 토큰이 유효하지 않을 경우 에러 raise
    """
    try:
        user_id: str = decoded['user_id']
    except KeyError:
        raise CredentialsException
    return user_id


async def get_user_client(user_id: str = Depends(get_user_id)) -> KloudClient:
    """
    redis에서 임시 자격증명을 가져와 객체를 생성함.
    """
    cred = await get_cred_from_redis(user_id)
    if cred is None:
        raise UserNotInDBException  # 없는 유저
    else:
        session_instance = create_temp_session(cred)
        kloud_client = KloudClient(user_id, session_instance)
        return kloud_client
