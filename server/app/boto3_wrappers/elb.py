import boto3
import asyncio
from .kloud_boto3_wrapper import KloudBoto3Wrapper


class KloudELB(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._elb_cli = session_instance.client('elbv2')

    async def get_load_balancers(self) -> dict:
        to_return = dict()
        res: dict = await asyncio.to_thread(self._elb_cli.describe_load_balancers)
        lbs: list = res['LoadBalancers']

        for lb in lbs:
            lb_name = lb['LoadBalancerArn']
            lb['resource_type'] = 'elb'
            to_return[lb_name] = lb

        return to_return

