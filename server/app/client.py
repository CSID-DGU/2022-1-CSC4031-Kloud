import boto3
from concurrent.futures import ThreadPoolExecutor
from .kloud_resource_clients.kloud_cost_explorer_client import KloudCostExplorer
from .kloud_resource_clients.kloud_resource_client import KloudInfraFetcher


class KloudClient(KloudInfraFetcher, KloudCostExplorer):
    def __init__(self, access_key_id: str, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        super().__init__(session_instance, loop, executor)
        self.id = access_key_id
        self.session_instance = session_instance
