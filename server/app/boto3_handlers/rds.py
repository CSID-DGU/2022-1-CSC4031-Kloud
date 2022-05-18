import asyncio

import boto3

from server.app.boto3_handlers.common_funcs import fetch_and_process
from server.app.boto3_handlers.kloud_resource_client import KloudResourceClient


class KloudRDS(KloudResourceClient):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._rds_client = session_instance.client(service_name="rds")

    async def describe_rds(self):
        return await asyncio.to_thread(fetch_and_process,
                                       identifier='DBInstanceIdentifier',
                                       describing_method=self._rds_client.describe_db_instances)