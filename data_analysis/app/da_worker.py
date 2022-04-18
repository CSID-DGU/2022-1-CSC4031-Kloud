from celery import Celery

celery_task = Celery(
    'da_app',
    broker='redis://kloud_redis:6379/0',
    backend='redis://kloud_redis:6379/0',
    include=['app.da_tasks']
)

