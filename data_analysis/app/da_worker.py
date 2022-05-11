from celery import Celery
from .conf.redis_conf import HOST, PORT, CELERYDB


celery_task = Celery(
    'da_app',
    broker=f'redis://{HOST}:{PORT}/{CELERYDB}',
    backend=f'redis://{HOST}:{PORT}/{CELERYDB}',
    include=['app.da_tasks']
)

