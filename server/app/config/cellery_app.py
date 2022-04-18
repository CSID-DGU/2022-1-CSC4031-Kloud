from celery import Celery

da_app = Celery(
    'da_app',
    broker='redis://kloud_redis:6379/0',
    backend='redis://kloud_redis:6379/0',
)

