import os

HOST = os.environ.get('REDIS_HOST')
if HOST is None:
    HOST = 'kloud_redis'  # docker-compose

PORT = 6379
CELERYDB = 0  # redis db num
CREDDB = 1
