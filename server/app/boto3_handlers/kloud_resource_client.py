import boto3


class KloudResourceClient:
    def __init__(self, session_instance: boto3.Session):
        self._session = session_instance