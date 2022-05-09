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


def get_describing_methods_dict(ec2_client, rds_client) -> dict:
    """
    client 인자는 boto3로 생성된 클라이언트 객체

    key: resource identifier
    value: function
    """
    describing_methods = {'VpcId': ec2_client.describe_vpcs,
                          'SubnetId': ec2_client.describe_subnets,
                          'NetworkInterfaceId': ec2_client.describe_network_interfaces,
                          'InternetGatewayId': ec2_client.describe_internet_gateways,
                          'NatGatewayId': ec2_client.describe_nat_gateways,
                          'InstanceId': ec2_client.describe_instances,
                          'DBInstanceIdentifier': rds_client.describe_db_instances
                          }
    return describing_methods


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

    def get_describing_methods_dict(self) -> dict:
        return get_describing_methods_dict(self._ec2_client, self._rds_client)

    @staticmethod
    def _response_process(identifier, describing_method) -> dict:  # 응답을 받아서 후처리함.
        """
        identifier: str
        describing_method: function

        응답을 받아서 후처리함.
        resource_id와 resource_type 정보를 추가함.
        boto3 조회 요청은 스레드에서 실행되어야하기 때문에 결과값을 받아서 넣지 않고 describing method를 인자로 넣음.
        """
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
        """
        :return list 안에 dict 객체 포함. 각 dict 객체는 resource 하나에 대응됨.
        """
        boto3_reqs = list()  # run in executor 작업 목록
        for identifier, describing_method in self.get_describing_methods_dict().items():
            # identifier: str, describing_method: function
            func = functools.partial(self._response_process, identifier=identifier,
                                     describing_method=describing_method)
            future = self.loop.run_in_executor(executor=self.executor, func=func)
            boto3_reqs.append(future)
        return boto3_reqs

    async def _update_resource_dict(self) -> dict:
        """
        인프라 정보를 받고, 객체 멤버인 self._resources 에 저장한 후, 인프라 정보를 반환함.
        본래 인프라 정보를 캐시하려고 하였으나, thread unsafe 문제와 배포환경에서 발생 가능성 있는 몇 가지 문제에 대응하기 번거로움.
        self._resource를 참조하지 않고 return 값을 받아 사용하는 것이 바람직함.
        """
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

    async def get_cost_history(self, time_period: dict = None, granularity: str = None) -> dict:
        if time_period is None:
            time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=90))),
                           'End': str(datetime.date(datetime.now()))}
        if granularity is None:
            granularity = 'DAILY'

        fun = functools.partial(self._ce_client.get_cost_and_usage,
                                TimePeriod=time_period,
                                Granularity=granularity,
                                Metrics=['UnblendedCost', 'UsageQuantity'],
                                GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'},
                                         {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}])
        res = await self.loop.run_in_executor(executor=self.executor, func=fun)
        return res

    def get_ec2_instances_cost_history(self, show_usage_type_and_quantity: bool, granularity: str):
        time_period = {'Start': str(datetime.date(datetime.now() - timedelta(days=14))),  # 인스턴스당 비용은 최대 14일까지만
                       'End': str(datetime.date(datetime.now()))}

        ec2_dict: dict = self._response_process(identifier='InstanceId',
                                                describing_method=self._ec2_client.describe_instances)
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
        return await self.loop.run_in_executor(executor=self.executor, func=fun)

    async def get_default_cost_history(self) -> dict:
        return await self.get_cost_history()

    async def get_infra_tree(self) -> dict:
        resources = await self.get_current_infra_dict()
        return self._build_tree(resources)

    @staticmethod
    def _get_parent(child: dict) -> str:
        """
        :param child: parent를 조회할 resource
        :return: parent의 resource_id
        """
        resource_type = child['resource_type']
        if resource_type in PARENT.keys():
            return child.get(PARENT[resource_type])
        else:
            pass

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

    def _build_tree(self, infra_data: dict) -> dict:
        """
        가공된 인프라 데이터를 기반으로 부모 자식 관계 정보를 설정하여 nested dictionary 형태로 만듦.
        """
        for key, val in infra_data.items():
            parent = self._get_parent(val)
            if parent:
                infra_data[key]['parent'] = parent  # 부모노드와 자식노드 둘 다 업데이트
                if infra_data[parent].get('children') is None:
                    infra_data[parent]['children'] = dict()
                infra_data[parent]['children'][key] = val
            else:
                pass

        to_return = dict()  # 초기화
        to_return['orphan'] = dict()  # 초기화

        for k, v in infra_data.items():
            resource_type = v.get('resource_type')
            parent = v.get('parent')
            if resource_type in POSSIBLE_ROOT_NODES and parent is None:
                to_return[k] = v
            elif resource_type not in POSSIBLE_ROOT_NODES and parent is None:
                to_return['orphan'][k] = v
        return to_return
