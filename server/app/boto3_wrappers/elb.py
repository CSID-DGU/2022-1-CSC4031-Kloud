import boto3
import asyncio
from .kloud_boto3_wrapper import KloudBoto3Wrapper
import functools


class KloudELB(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._elb_cli = session_instance.client('elbv2')

    async def get_load_balancers(self) -> dict:
        to_return = await self.fetch_and_process_async('LoadBalancerArn',
                                                       self._elb_cli.describe_load_balancers)
        return to_return
