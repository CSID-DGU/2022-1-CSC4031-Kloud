import asyncio
import boto3

from .cost_explorer import KloudCostExplorer
from .rds import KloudRDS
from .ec2 import KloudEC2
from .ecs import KloudECS
from .elb import KloudELB
from .cloudwatch import KloudCloudWatch

POSSIBLE_ROOT_NODES = {'vpc', 'ecs_cluster'}
PARENT = {
    'subnet': 'VpcId',
    'ec2': 'SubnetId',
    'elb': 'VpcId',
    'ecs_service': 'clusterArn'
}


class InfraTreeBuilder:
    """
    인프라 시각화를 위한 nested dict 생성용 객체
    """

    def __init__(self, infra_data: dict):
        self.infra_data = infra_data

    @staticmethod
    def _get_parent(child: dict) -> str:
        """
        :param child: parent를 조회할 resource
        :return: parent의 resource_id
        """
        resource_type = child['resource_type']
        if resource_type in PARENT.keys():
            return child.get(PARENT[resource_type])  # child 딕셔너리에서 부모 리소스 id 가져옴
        else:
            pass

    @staticmethod
    def _get_vpc_parent(vpc_id: str, resources: dict) -> str:
        """
        igw를 vpc의 부모 노드로 놓으려는 경우, describe vpcs에는 igw정보가 없기 때문에 resource 전체를 탐색해서 할당된 igw가 있는지 확인해야함.
        """
        for key, val in resources.items():
            if val['resource_type'] == 'igw':
                for vpcs in val['Attachments']:
                    if vpcs['VpcId'] == vpc_id:
                        return key

    def build_tree(self) -> dict:
        """
        가공된 인프라 데이터를 기반으로 부모 자식 관계 정보를 설정하여 nested dictionary 형태로 만듦.
        """
        infra_data = self.infra_data
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


class KloudClient(KloudEC2, KloudRDS, KloudECS, KloudELB, KloudCloudWatch, KloudCostExplorer):
    def __init__(self, access_key_id: str, session_instance: boto3.Session):
        super().__init__(session_instance)
        self.id: str = access_key_id
        self.describing_coroutines: list = [  # 리스트 요소들은 coroutine
            self.get_ec2_resources,
            self.get_rds_resources,
            self.get_ecs_resources,
            self.get_load_balancers
        ]

    async def get_current_infra_dict(self) -> dict:
        to_return = dict()
        tasks = list()
        for task in self.describing_coroutines:
            tasks.append(task())  # coroutine await 하지 않고 실행 후 리스트에 넣음.
        done, pending = await asyncio.wait(tasks)  # 코루틴 한꺼번에 await. pending은 asyncio 리턴값 형식 때문에 필요. 사용 x.
        for task in done:
            to_return.update(task.result())  # 받아온 인프라 정보들 모두 한 딕셔너리에 합침.
        return to_return

    async def get_infra_tree(self) -> dict:
        # 인프라 정보 받아온 후 트리 생성
        resources = await self.get_current_infra_dict()
        tb = InfraTreeBuilder(resources)
        return tb.build_tree()

    async def get_top_3_usage_average(self) -> dict:
        to_return = dict()
        top3_with_cost = await self.get_total_cost_by_instance_with_top_3_usage()
        for resource_id in top3_with_cost['top3']:
            average_utilization = await self.async_get_resource_utilization(resource_id)
            to_return[resource_id] = average_utilization
        return to_return
