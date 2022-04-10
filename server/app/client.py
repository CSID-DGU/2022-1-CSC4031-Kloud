import boto3
from datetime import datetime, timedelta
import asyncio
import functools
import concurrent.futures

RESOURCE_IDENTIFIERS = {'VpcId': 'vpc',
                        'SubnetId': 'subnet',
                        'NetworkInterfaceId': 'network_interface',
                        'InternetGatewayId': 'igw',
                        'NatGatewayId': 'ngw',
                        'InstanceId': 'ec2',  # todo ec2 이외에도 InstanceId인 경우 있는지 확인할 것
                        'DBInstanceIdentifier': 'rds'
                        }

GROUP_BY_DIMENSION = ["AZ", "INSTANCE_TYPE", "LEGAL_ENTITY_NAME", "INVOICING_ENTITY", "LINKED_ACCOUNT", "OPERATION",
                      "PLATFORM", "PURCHASE_TYPE", "SERVICE", "TENANCY", "RECORD_TYPE", "USAGE_TYPE"]

PARENT = {
    'vpc': 'root',
    'subnet': 'VpcId',
    'ec2': 'SubnetId',
}


class KloudClient:
    def __init__(self, access_key_id: str, session_instance: boto3.Session, loop, executor: concurrent.futures.ThreadPoolExecutor):
        self.id = access_key_id
        self.loop = loop  # 비동기 이벤트 루프
        self.executor = executor  # con

        #### boto3 ####
        self._session = session_instance
        self._ec2_client = session_instance.client(service_name="ec2")
        self._rds_client = session_instance.client(service_name="rds")
        self._ce_client = session_instance.client(service_name="ce")
        #### boto3 ####

        self._resources = dict()
        self._describing_methods = {'VpcId': self._ec2_client.describe_vpcs,
                                    'SubnetId': self._ec2_client.describe_subnets,
                                    'NetworkInterfaceId': self._ec2_client.describe_network_interfaces,
                                    'InternetGatewayId': self._ec2_client.describe_internet_gateways,
                                    'NatGatewayId': self._ec2_client.describe_nat_gateways,
                                    'InstanceId': self._ec2_client.describe_instances,
                                    'DBInstanceIdentifier': self._rds_client.describe_db_instances
                                    }

    async def _update_resource_dict(self) -> None:
        boto3_reqs = []
        for identifier, describing_method in self._describing_methods.items():
            boto3_reqs.append(self.loop.run_in_executor(self.executor,
                                                        functools.partial(self._response_process,
                                                                          identifier=identifier,
                                                                          describing_method=describing_method)))
        completed, pending = await asyncio.wait(boto3_reqs)
        for task in completed:
            result = task.result()
            if result is not None:
                resource_id = result['resource_id']
                self._resources[resource_id] = result

    def _response_process(self, identifier, describing_method) -> dict:  # 응답을 받아서 후처리함.
        response: list = self.cut_useless_metadata(describing_method())
        if identifier == 'InstanceId':  # ec2 인스턴스일 경우
            try:
                response = response[0]['Instances']
            except IndexError:  # ec2 인스턴스가 없을 경우
                pass
        for dic in response:  # 응답이 존재하지 않는 경우 for문이 실행되지 않고 넘어감.
            primary_key = dic[identifier]
            dic['resource_id'] = primary_key
            dic['resource_type'] = RESOURCE_IDENTIFIERS[identifier]
            return dic

    @staticmethod
    def cut_useless_metadata(data: dict) -> list:  # todo 예외 있는지 확인
        processed = dict()
        for k, v in data.items():  # 첫번째 딕셔너리가 응답이고, 두번째가 메타데이터임.
            processed = v
            break
        return processed

    async def get_current_infra_dict(self) -> dict:
        await self._update_resource_dict()
        return self._resources

    async def get_cost_history(self, time_period: dict, granularity: str) -> dict:
        res = self._ce_client.get_cost_and_usage(TimePeriod=time_period,
                                                 Granularity=granularity,
                                                 Metrics=['UnblendedCost', 'UsageQuantity'],
                                                 GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                                                          {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}])
        return res

    async def get_default_cost_history(self) -> dict:
        tp = {
            'Start': str(datetime.date(datetime.now() - timedelta(days=90))),
            'End': str(datetime.date(datetime.now()))
        }
        granularity = 'DAILY'
        return await self.get_cost_history(time_period=tp, granularity=granularity)

    async def get_infra_tree(self) -> dict:
        await self.get_current_infra_dict()
        return self.get_tree(self._resources)

    @staticmethod
    def get_parent(child: dict):
        try:
            resource_type = child['resource_type']
            return child.get(PARENT[resource_type])
        except KeyError:
            pass

    def get_tree(self, data: dict):
        for key, val in data.items():
            parent = self.get_parent(val)
            try:
                data[key]['parent'] = parent
                if data[parent].get('children') is None:
                    data[parent]['children'] = {}
                if val['resource_type'] != 'vpc':
                    data[parent]['children'][key] = val
            except KeyError:
                pass  # 부모가 None인 경우. 부모관계가 없는 resource

        to_return = dict()
        for k, v in data.items():
            if v.get('resource_type') == 'vpc':
                to_return[k] = v
        return to_return
