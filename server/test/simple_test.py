'''
서버를 실행시킨 후에 실행하면 됩니다.
'''
import requests
import unittest
from aws_iam_cred import aws_access_key_id, aws_secret_access_key, region  # 직접 만드셔야합니다.
import json
import time

host = 'http://127.0.0.1:8000'  # 변동 가능
login_data = {
    'access_key_public': aws_access_key_id,
    'access_key_secret': aws_secret_access_key,
    'region': region
}


def get_full_url(uri: str) -> str:
    return host+uri


def bearer_token(token) -> dict:
    return {'Authorization': f'Bearer {token}'}


def post(url, data: dict = None, token=None):
    if token is not None:
        return requests.post(url=get_full_url(url), data=json.dumps(data), headers=bearer_token(token))
    elif data is None:
        return requests.post(url=get_full_url(url), headers=bearer_token(token))
    else:
        return requests.post(url=get_full_url(url), data=json.dumps(data))


def get(url, token):
    return requests.get(url=get_full_url(url), headers=bearer_token(token))


def login():
    res = requests.post(
        url=get_full_url('/login'),
        data=json.dumps(login_data)
    )
    access_token_dict = res.json()
    assert res.status_code == 200
    return access_token_dict


actk = login()['access_token']


class KloudTest(unittest.TestCase):
    def setUp(self) -> None:  # 각 테스트 케이스 시작 전마다 반복됨.
        # self.access_token_dict = login()
        # self.access_token = self.access_token_dict['access_token']
        self.access_token = actk

    def default_test(self, res):
        assert res.status_code == 200
        try:
            res.json()
        except json.JSONDecodeError:
            self.fail()

    def test_infra_info(self):
        res = get('/infra/info', self.access_token)
        self.default_test(res)

    def test_infra_tree(self):
        res = get('/infra/tree', self.access_token)
        self.default_test(res)

    def test_cost_history_default(self):
        res = get('/cost/history/default', self.access_token)
        self.default_test(res)

    def test_pattern_finder(self):
        res = get('/cost/trend/similarity', self.access_token)
        self.default_test(res)

    def test_pattern_finder2(self):
        res = get("/cost/trend/prophet", self.access_token)
        self.default_test(res)

    def test_zlogout(self):  # 알파벳 순서대로 실행됨. 로그아웃은 맨 마지막에 실행.
        # ac = login()['access_token']
        ac = self.access_token
        res = post("/logout", token=ac)
        assert res.status_code == 200
        time.sleep(0.1)  # 비동기 처리 시간 감안하여 지연
        res = get('/infra/info', ac)
        assert res.status_code == 401  # 토큰 revoke 여부 확인


