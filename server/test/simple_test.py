'''
서버를 실행시킨 후에 실행하면 됩니다.
'''
import requests
import unittest
from aws_iam_cred import aws_access_key_id, aws_secret_access_key, region  # 직접 만드셔야합니다.
import json

host = 'http://127.0.0.1:8000'  # 변동 가능
login_data = {
    'access_key_public': aws_access_key_id,
    'access_key_secret': aws_secret_access_key,
    'region': region
}


def get_full_url(uri: str) -> str:
    return host+uri


def post(url, data: dict):
    return requests.post(url=get_full_url(url), data=json.dumps(data))


def login():
    res = requests.post(
        url=get_full_url('/login'),
        data=json.dumps(login_data)
    )
    access_token_dict = res.json()
    assert res.status_code == 200
    return access_token_dict


class KloudTest(unittest.TestCase):
    def setUp(self) -> None:
        self.access_token_dict = login()

    def default_test(self, res):
        assert res.status_code == 200
        try:
            res.json()
        except json.JSONDecodeError:
            self.fail()

    def test_infra_info(self):
        res = post('/infra/info', self.access_token_dict)
        self.default_test(res)

    def test_infra_tree(self):
        res = post('/infra/tree', self.access_token_dict)
        self.default_test(res)

    def test_cost_history_default(self):
        res = post('/cost/history/default', self.access_token_dict)
        self.default_test(res)
