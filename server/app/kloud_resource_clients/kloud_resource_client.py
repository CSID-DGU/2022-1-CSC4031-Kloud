import asyncio
import functools
from concurrent.futures import ThreadPoolExecutor

import boto3

from .common_funcs import get_describing_methods_dict, fetch_and_process, PARENT, POSSIBLE_ROOT_NODES


class KloudResourceClient:
    def __init__(self, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        self.loop = loop  # 비동기 이벤트 루프
        self.executor = executor  # thread pool executor
        self._session = session_instance


class KloudEC2Client(KloudResourceClient):
    """
    boto3 ec2 클라이언트 래퍼
    """
    def __init__(self, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        super().__init__(session_instance, loop, executor)
        self._ec2_client = session_instance.client(service_name="ec2")
        self._describing_methods = get_describing_methods_dict(ec2_client=self._ec2_client)

    async def _fetch_infra_info(self) -> list:
        """
        :return list 안에 dict 객체 포함. 각 dict 객체는 resource 하나에 대응됨.
        """
        boto3_reqs = list()  # run in executor 작업 목록
        for identifier, describing_method in self._describing_methods.items():
            # identifier: str, describing_method: function
            func = functools.partial(fetch_and_process, identifier=identifier,
                                     describing_method=describing_method)
            future = self.loop.run_in_executor(executor=self.executor, func=func)
            boto3_reqs.append(future)
        return boto3_reqs

    async def _update_resource_dict(self) -> dict:
        """
        인프라 정보를 받고, 객체 멤버인 self._resources 에 저장한 후, 인프라 정보를 반환함.
        본래 인프라 정보를 캐시하려고 하였으나, thread unsafe 문제와 배포환경에서 발생 가능성 있는 몇 가지 문제에 대응하기 번거로움.
        """
        to_return = dict()
        reqs: list = await self._fetch_infra_info()  # boto3에 인프라 정보 요청
        done, pending = await asyncio.wait(reqs)  # 작업이 모두 완료될 때 까지 대기

        for task in done:
            result: dict = task.result()
            if result is not None:  # 인프라가 없거나 하면 None
                for key, val in result.items():
                    to_return[key] = val
        return to_return

    async def get_current_ec2_cli_infra_dict(self) -> dict:
        return await self._update_resource_dict()

    def start_instance(self, instance_id: str) -> None:
        self._ec2_client.start_instances(
            InstanceIds=[instance_id]
        )

    def stop_instance(self, instance_id: str, hibernate: bool, force: bool) -> None:
        self._ec2_client.stop_instances(
            InstanceIds=[instance_id],
            Hibernate=hibernate,
            Force=force
        )

    async def describe_all(self) -> dict:
        return await self.get_current_ec2_cli_infra_dict()


class KloudRDSClient(KloudResourceClient):
    def __init__(self, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        super().__init__(session_instance, loop, executor)
        self._rds_client = session_instance.client(service_name="rds")

    async def describe_rds(self):
        return await asyncio.to_thread(fetch_and_process,
                                       identifier='DBInstanceIdentifier',
                                       describing_method=self._rds_client.describe_db_instances)


class KloudInfraFetcher(KloudEC2Client, KloudRDSClient):
    def __init__(self, session_instance: boto3.Session, loop, executor: ThreadPoolExecutor):
        super().__init__(session_instance, loop, executor)
        self.session_instance = session_instance
        self.describing_tasks = [
            self.get_current_ec2_cli_infra_dict(),
            self.describe_rds()
        ]

    async def get_current_infra_dict(self) -> dict:
        to_return = dict()
        tasks = [self.get_current_ec2_cli_infra_dict(), self.describe_rds()]
        done, pending = await asyncio.wait(tasks)
        for task in done:
            to_return.update(task.result())
        return to_return

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
