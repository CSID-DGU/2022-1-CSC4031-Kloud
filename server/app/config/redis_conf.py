import datetime

HOST = 'kloud_redis'
PORT = 6379
CELERYDB = 0  # redis db num
CREDDB = 1
CRED_EXP = datetime.timedelta(minutes=59)  # sts에서 발급받은 임시 크레딧 redis 저장 기간