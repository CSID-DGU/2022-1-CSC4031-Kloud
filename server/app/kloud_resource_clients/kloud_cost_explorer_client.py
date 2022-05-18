import asyncio
import functools
from datetime import datetime, timedelta

import boto3

from .common_funcs import fetch_and_process


class KloudCostExplorer:
    def __init__(self, session_instance: boto3.Session):
        self._ce_client = session_instance.client(service_name="ce")
        self.session_instance = session_instance

    async def get_cost_history(self, days: int = 90, granularity: str = None) -> dict:
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=days))),
                       'End': str(datetime.date(datetime.now()))}
        if granularity is None:
            granularity = 'DAILY'

        fun = functools.partial(self._ce_client.get_cost_and_usage,
                                TimePeriod=time_period,
                                Granularity=granularity,
                                Metrics=['UnblendedCost', 'UsageQuantity'],
                                GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                                         {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}])
        res = await asyncio.to_thread(fun)
        return res

    def get_ec2_instances_cost_history(self, show_usage_type_and_quantity: bool, granularity: str):
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=14))),  # 인스턴스당 비용은 최대 14일까지만
                       'End': str(datetime.date(datetime.now()))}
        ec2_dict: dict = fetch_and_process(identifier='InstanceId',
                                           describing_method=self.session_instance.client("ec2").describe_instances)

        resource_id_list = list(ec2_dict.keys())  # ec2 이외 다른 리소스도 조회가 가능할 경우, 키만 가져와서 합치면 됨.
        metrics = ['UnblendedCost']
        group_by = [{'Type': 'DIMENSION', 'Key': 'RESOURCE_ID'}]

        if show_usage_type_and_quantity is True:
            metrics.append('UsageQuantity')
            group_by.append({'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'})

        res = self._ce_client.get_cost_and_usage_with_resources(
            TimePeriod=time_period,
            Granularity=granularity,
            Filter={
                'Dimensions': {
                    'Key': 'RESOURCE_ID',
                    'Values': resource_id_list,
                    'MatchOptions': ['EQUALS']
                }
            },
            Metrics=metrics,
            GroupBy=group_by
        )
        return res['ResultsByTime']

    async def get_cost_history_by_instances(self, show_usage_type_and_quantity: bool, granularity: str) -> dict:
        """
        :param show_usage_type_and_quantity: bool
        :param granularity: MONTHLY|DAILY|HOURLY
        :return: dict
        """

        fun = functools.partial(self.get_ec2_instances_cost_history,
                                show_usage_type_and_quantity=show_usage_type_and_quantity,
                                granularity=granularity)
        return await asyncio.to_thread(fun)

    async def get_default_cost_history(self) -> dict:
        return await self.get_cost_history()