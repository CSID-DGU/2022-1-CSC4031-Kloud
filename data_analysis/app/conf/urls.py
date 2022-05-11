import os
API_SERVER = os.environ.get('KLOUD_FASTAPI_SERVER')
if API_SERVER is None:
    API_SERVER = 'http://kloud_fast_api:8000'
COST_HISTORY_DEFAULT = '/cost/history/default'

