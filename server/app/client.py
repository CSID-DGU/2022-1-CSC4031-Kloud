import boto3


class KloudClient:
    def __init__(self, access_key_id: str, session_instance: boto3.Session):
        self.id = access_key_id
        self.session = session_instance
        self.infra_info: dict
        self.services: dict

    def build_infra_dict(self):
        pass


