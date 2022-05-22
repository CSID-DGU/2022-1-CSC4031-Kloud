import asyncio
import functools
from datetime import datetime, timedelta
from collections import defaultdict

import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper

DEFAULT_METRICS = ['UnblendedCost', 'UsageQuantity']
DEFAULT_GROUP_BY = [{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}]


class KloudCostExplorer(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._ce_client = session_instance.client(service_name="ce")

    async def get_cost_history(self, days: int = 90, granularity: str = None, metrics=None, group_by=None) -> dict:
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=days))),
                       'End': str(datetime.date(datetime.now()))}
        if granularity is None:
            granularity = 'DAILY'
        if metrics is None:
            metrics = DEFAULT_METRICS
        if group_by is None:
            group_by = DEFAULT_GROUP_BY

        fun = functools.partial(self._ce_client.get_cost_and_usage,
                                TimePeriod=time_period,
                                Granularity=granularity,
                                Metrics=metrics,
                                GroupBy=group_by)
        res = await asyncio.to_thread(fun)
        return res

    async def get_cost_history_by_service(self, days: int = 90) -> dict:
        metrics = ['BlendedCost']
        group_by = [{
            'Type': 'DIMENSION', 'Key': 'SERVICE'
        }]
        res = await self.get_cost_history(days=days, granularity='MONTHLY', metrics=metrics, group_by=group_by)
        results_by_time: list = res['ResultsByTime']
        to_return: defaultdict = defaultdict(float)

        for monthly_cost_dict in results_by_time:
            groups: list = monthly_cost_dict['Groups']
            for each_cost_group in groups:
                key = each_cost_group['Keys'][0]
                value = float(each_cost_group['Metrics']['BlendedCost']['Amount'])
                to_return[key] += value

        return dict(to_return)

    def get_ec2_instances_cost_history(self, show_usage_type_and_quantity: bool, granularity: str):
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=14))),  # 인스턴스당 비용은 최대 14일까지만
                       'End': str(datetime.date(datetime.now()))}
        ec2_dict: dict = self.fetch_and_process(identifier='InstanceId',
                                                describing_method=self.session.client("ec2").describe_instances)

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
