FROM kshshkim/kloud_celery_base

COPY . /code
WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
HEALTHCHECK CMD celery inspect ping -A da_app.add -d celery@$HOSTNAME
ENTRYPOINT celery -A app.da_tasks worker --loglevel=info