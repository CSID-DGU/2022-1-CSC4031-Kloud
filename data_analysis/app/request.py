import requests
from .conf.urls import API_SERVER, COST_HISTORY_DEFAULT


def get_cost_info(token):
    data = requests.get(url=API_SERVER + COST_HISTORY_DEFAULT, headers={'Authorization': f'Bearer {token}'}).json()
    return data
