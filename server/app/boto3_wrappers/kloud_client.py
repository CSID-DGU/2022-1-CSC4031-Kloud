import asyncio

import boto3

from .common_funcs import PARENT, POSSIBLE_ROOT_NODES
from .cost_explorer import KloudCostExplorer
from .rds import KloudRDS
from .ec2 import KloudEC2
from .ecs import KloudECS


class InfraTreeBuilder:
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


class KloudClient(KloudEC2, KloudRDS, KloudECS, KloudCostExplorer):
    def __init__(self, access_key_id: str, session_instance: boto3.Session):
        super().__init__(session_instance)
        self.id = access_key_id
        self.describing_tasks = [  # async def 이기 때문에 await 하지 않을 시 awaitable 객체 반환
            self.get_ec2_resources,
            self.get_rds_resources,
            self.get_ecs_resources
        ]

    async def get_current_infra_dict(self) -> dict:
        to_return = dict()
        tasks = list()
        for task in self.describing_tasks:
            tasks.append(task())
        done, pending = await asyncio.wait(tasks)
        for task in done:
            to_return.update(task.result())
        return to_return

    async def get_infra_tree(self) -> dict:
        resources = await self.get_current_infra_dict()
        tb = InfraTreeBuilder(resources)
        return tb.build_tree()

