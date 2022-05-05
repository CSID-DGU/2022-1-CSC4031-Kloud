import boto3
from datetime import datetime, timedelta
import asyncio
import functools
from concurrent.futures import ThreadPoolExecutor

RESOURCE_TYPE = {'VpcId': 'vpc',
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
    'subnet': 'VpcId',
    'ec2': 'SubnetId',
}

POSSIBLE_ROOT_NODES = {'vpc'}


def cut_useless_metadata(data: dict) -> list:  # todo 예외 있는지 확인
    processed = dict()
    for k, v in data.items():  # dict의 첫번째 값이 응답이고, 두번째가 메타데이터임.
        processed = v
        break
    return processed


class KloudClient:
    def __init__(self, access_key_id: str, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        self.id = access_key_id
        self.loop = loop  # 비동기 이벤트 루프
        self.executor = executor  # thread pool executor

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

    @staticmethod
    def _response_process(identifier, describing_method) -> dict:  # 응답을 받아서 후처리함.
        response: list = cut_useless_metadata(describing_method())
        if identifier == 'InstanceId':  # ec2 인스턴스일 경우
            try:
                instances = list()
                for group_dict in response:
                    for instance_dict in group_dict['Instances']:
                        instances.append(instance_dict)

                response = instances
            except IndexError:  # ec2 인스턴스가 없을 경우
                pass
        to_return = dict()
        for dic in response:  # 응답이 존재하지 않는 경우 for문이 실행되지 않고 넘어감.
            primary_key = dic[identifier]
            dic['resource_id'] = primary_key
            dic['resource_type'] = RESOURCE_TYPE[identifier]
            to_return[primary_key] = dic
        return to_return

    async def _fetch_infra_info(self) -> list:
        boto3_reqs = []  # run in executor 작업 목록
        for identifier, describing_method in self._describing_methods.items():  # identifier: str, describing_method: function
            func = functools.partial(self._response_process, identifier=identifier,
                                     describing_method=describing_method)
            future = self.loop.run_in_executor(executor=self.executor, func=func)
            boto3_reqs.append(future)
        return boto3_reqs

    async def _update_resource_dict(self) -> dict:
        to_return = dict()
        reqs: list = await self._fetch_infra_info()  # boto3에 인프라 정보 요청
        done, pending = await asyncio.wait(reqs)  # 작업이 모두 완료될 때 까지 대기

        for task in done:
            result: dict = task.result()
            if result is not None:  # 인프라가 없거나 하면 None
                for key, val in result.items():
                    to_return[key] = val
        self._resources = to_return
        return to_return

    async def get_current_infra_dict(self) -> dict:
        return await self._update_resource_dict()

    async def get_cost_history(self, time_period: dict, granularity: str) -> dict:
        fun = functools.partial(self._ce_client.get_cost_and_usage,
                                TimePeriod=time_period,
                                Granularity=granularity,
                                Metrics=['UnblendedCost', 'UsageQuantity'],
                                GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                                         {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}])

        res = await self.loop.run_in_executor(executor=self.executor, func=fun)
        return res

    def get_ec2_instances_cost_history(self):
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=14))),  # 인스턴스당 비용은 최대 14일까지만
                       'End': str(datetime.date(datetime.now()))}

        ec2_dict = self._response_process(identifier='InstanceId',
                                          describing_method=self._ec2_client.describe_instances)
        infra_keys = list(ec2_dict.keys())  # ec2 이외 다른 리소스도 조회가 가능할 경우, 키만 가져와서 합치면 됨.

        res = self._ce_client.get_cost_and_usage_with_resources(
            TimePeriod=time_period,
            Granularity='MONTHLY',
            Filter={
                'Dimensions': {
                    'Key': 'RESOURCE_ID',
                    'Values': infra_keys,
                    'MatchOptions': ['EQUALS']
                }
            },
            Metrics=['UnblendedCost'],
            GroupBy=[{'Type': 'DIMENSION',
                      'Key': 'RESOURCE_ID'},
                     # {'Type': 'DIMENSION',
                     #  'Key': 'USAGE_TYPE'}
                     # 네트워크 사용료, 저장장치 사용료 분리해서 표시 가능. 추후 인프라당 한 달 예상비용 보여줄 경우엔 저장장치와 네트워크 사용 예상량 합하면 될듯함.
                     ]
        )
        return res

    async def get_cost_history_by_instances(self):
        fun = self.get_ec2_instances_cost_history
        return await self.loop.run_in_executor(executor=self.executor, func=fun)

    async def get_default_cost_history(self) -> dict:
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=90))),
                       'End': str(datetime.date(datetime.now()))}
        granularity = 'DAILY'
        return await self.get_cost_history(time_period=time_period, granularity=granularity)

    async def get_infra_tree(self) -> dict:
        resources = await self.get_current_infra_dict()
        return self._get_tree(resources)

    def _get_parent(self, child: dict, resources: dict) -> str:
        # resource_type = child.get('resource_type')
        # if resource_type == 'vpc':
        #     return self._get_vpc_parent(child.get('resource_id'), resources)
        # try:
        resource_type = child['resource_type']
        if resource_type in PARENT.keys():
            return child.get(PARENT[resource_type])
        else:
            pass
        # except KeyError:
        #     pass

    @staticmethod
    def _get_vpc_parent(vpc_id: str, resources: dict) -> str:
        """
        describe vpcs에는 igw정보가 없기 때문에 resource 전체를 탐색해서 할당된 igw가 있는지 확인해야함.
        """
        for key, val in resources.items():
            if val['resource_type'] == 'igw':
                for vpcs in val['Attachments']:
                    if vpcs['VpcId'] == vpc_id:
                        return key

    def _get_tree(self, infra_data: dict) -> dict:
        """
        데이터를 모두 가져온 상태에서 부모 자식 관계 정보를 설정함.
        """
        for key, val in infra_data.items():
            parent = self._get_parent(val, infra_data)
            if parent:
                infra_data[key]['parent'] = parent  # 부모노드와 자식노드 둘 다 업데이트
                if infra_data[parent].get('children') is None:
                    infra_data[parent]['children'] = dict()
                infra_data[parent]['children'][key] = val
            else:
                pass

        to_return = dict()
        to_return['orphan'] = dict()

        for k, v in infra_data.items():
            resource_type = v.get('resource_type')
            parent = v.get('parent')
            if resource_type in POSSIBLE_ROOT_NODES and parent is None:
                to_return[k] = v
            elif resource_type not in POSSIBLE_ROOT_NODES and parent is None:
                to_return['orphan'][k] = v
        return to_return


