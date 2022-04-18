import json
from aioredis import Redis
from .config.redis_conf import HOST, PORT, CREDDB, CRED_EXP

cred_db = Redis(host=HOST, port=PORT, db=CREDDB, decode_responses=True)


async def get_cred_from_redis(user_id: str) -> dict:
    jsonified = await cred_db.get(user_id)
    return json.loads(jsonified)


async def set_cred_to_redis(user_id: str, cred: dict) -> None:
    jsonified = json.dumps(cred)
    await cred_db.set(user_id, jsonified, CRED_EXP)


