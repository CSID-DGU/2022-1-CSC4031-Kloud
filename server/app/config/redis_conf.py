import datetime

HOST = 'kloud_redis'
PORT = 6379
CELERYDB = 0  # redis db num
CREDDB = 1
CACHEDB = 2
CRED_EXP = datetime.timedelta(minutes=59)  # sts에서 발급받은 임시 크레딧 redis 저장 기간
COST_EXP = datetime.timedelta(hours=12)  # 비용 데이터 캐시 유효기간
REVOKED_TOKENS = 'revoked'
