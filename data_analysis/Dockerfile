FROM python:3.8

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /code
WORKDIR /code

ENTRYPOINT celery -A app.da_tasks worker --loglevel=info