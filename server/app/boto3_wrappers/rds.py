import asyncio

import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper


class KloudRDS(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._rds_client = session_instance.client(service_name="rds")

    async def get_rds_resources(self):
        return await asyncio.to_thread(self.fetch_and_process,
                                       identifier='DBInstanceIdentifier',
                                       describing_method=self._rds_client.describe_db_instances)
