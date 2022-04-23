import requests
from .conf.urls import SERVER, COST_HISTORY_DEFAULT


def get_cost_info(token):
    data = requests.get(url=SERVER + COST_HISTORY_DEFAULT, headers={'Authorization': f'Bearer {token}'}).json()
    return data
