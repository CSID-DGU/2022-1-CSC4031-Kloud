from celery import Celery

from .redis_conf import HOST, PORT, CELERYDB

da_app = Celery(
    'da_app',
    broker=f'redis://{HOST}:{PORT}/{CELERYDB}',
    backend=f'redis://{HOST}:{PORT}/{CELERYDB}',
)

