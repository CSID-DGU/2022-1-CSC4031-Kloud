import asyncio
import functools
import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper


def get_describing_methods_dict(ec2_client) -> dict:
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
                          }
    return describing_methods


class KloudEC2(KloudBoto3Wrapper):
    """
    boto3 ec2 클라이언트 래퍼
    """

    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._ec2_client = session_instance.client(service_name="ec2")
        self._describing_methods = get_describing_methods_dict(ec2_client=self._ec2_client)

    async def _fetch_infra_info(self) -> list:
        """
        :return list 안에 dict 객체 포함. 각 dict 객체는 resource 하나에 대응됨.
        """
        boto3_reqs = list()  # run in executor 작업 목록
        for identifier, describing_method in self._describing_methods.items():
            # identifier: str, describing_method: function
            func = functools.partial(self.fetch_and_process, identifier=identifier, describing_method=describing_method)
            future = asyncio.to_thread(func)
            boto3_reqs.append(future)
        return boto3_reqs

    async def _update_resource_dict(self) -> dict:
        """
        인프라 정보를 받고, 객체 멤버인 self._resources 에 저장한 후, 인프라 정보를 반환함.
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

    async def get_ec2_resources(self) -> dict:
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


