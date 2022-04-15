from .da_worker import celery_task


@celery_task.task(name='add')
def add(x, y):  # 예시
    return x + y
