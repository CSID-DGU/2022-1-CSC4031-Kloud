import asyncio
import functools
from datetime import datetime, timedelta
from collections import defaultdict
import heapq

import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper

DEFAULT_METRICS = ['UnblendedCost', 'UsageQuantity']
DEFAULT_GROUP_BY = [{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}]
GROUP_BY_DIMENSION = ["AZ", "INSTANCE_TYPE", "LEGAL_ENTITY_NAME", "INVOICING_ENTITY", "LINKED_ACCOUNT", "OPERATION",
                      "PLATFORM", "PURCHASE_TYPE", "SERVICE", "TENANCY", "RECORD_TYPE", "USAGE_TYPE"]

AVAILABLE_RESERVATION = ['Amazon Elastic Compute Cloud - Compute',
                         'Amazon Relational Database Service',
                         'Amazon Redshift',
                         'Amazon ElastiCache',
                         'Amazon Elasticsearch Service',
                         'Amazon OpenSearch Service']
AVAILABLE_LOOK_BACK_PERIOD = ['SEVEN_DAYS', 'THIRTY_DAYS', 'SIXTY_DAYS']
PAYMENT_OPTIONS = ['NO_UPFRONT', 'PARTIAL_UPFRONT', 'ALL_UPFRONT', 'LIGHT_UTILIZATION', 'MEDIUM_UTILIZATION',
                   'HEAVY_UTILIZATION']
TERM_IN_YEARS = ['ONE_YEAR', 'THREE_YEARS']


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

    def _get_ec2_instances_cost_history(self, show_usage_type_and_quantity: bool, granularity: str) -> list:
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

    async def get_cost_history_by_instances(self, show_usage_type_and_quantity: bool, granularity: str) -> list:
        """
        :param show_usage_type_and_quantity: bool
        :param granularity: MONTHLY|DAILY|HOURLY
        :return: dict
        """

        fun = functools.partial(self._get_ec2_instances_cost_history,
                                show_usage_type_and_quantity=show_usage_type_and_quantity,
                                granularity=granularity)
        return await asyncio.to_thread(fun)

    async def get_total_cost_by_instance(self) -> dict:
        resource_data: list = await self.get_cost_history_by_instances(False, "MONTHLY")
        to_return = defaultdict(int)
        for unit in resource_data:
            needed_data = unit['Groups']
            for group in needed_data:
                instance_id = group["Keys"][0]
                cost = group["Metrics"]["UnblendedCost"]["Amount"]
                to_return[instance_id] += float(cost)
        to_return = dict(to_return)
        return to_return

    async def get_total_cost_by_instance_with_top_3_usage(self) -> dict:
        total_cost_by_instance: dict = await self.get_total_cost_by_instance()
        top_three = heapq.nlargest(3, total_cost_by_instance, total_cost_by_instance.get)
        to_return = dict()
        to_return['costs'] = total_cost_by_instance
        to_return['top3'] = top_three
        return to_return

    async def get_default_cost_history(self) -> dict:
        return await self.get_cost_history()

    def _get_reservation_recommendation(self, service: str, look_back_period: str, years: str,
                                        payment_option: str) -> dict:
        recommendation = self._ce_client.get_reservation_purchase_recommendation(Service=service,
                                                                                 LookbackPeriodInDays=look_back_period,
                                                                                 TermInYears=years,
                                                                                 PaymentOption=payment_option)
        return {"Recommendations": recommendation['Recommendations']}

    async def async_get_reservation_recommendation(self, service: str, look_back_period: str, years: str,
                                                   payment_option: str) -> dict:
        return await asyncio.to_thread(self._get_reservation_recommendation,
                                       service=service,
                                       look_back_period=look_back_period,
                                       years=years,
                                       payment_option=payment_option)
