import boto3


class KloudBoto3Wrapper:
    def __init__(self, session_instance: boto3.Session):
        self.session = session_instance