import asyncio
import functools
import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper


class KloudECS(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self.ecs_cli = session_instance.client("ecs")

    async def _get_cluster_arns(self) -> list:
        cluster_arns = await asyncio.to_thread(self.ecs_cli.list_clusters)
        return cluster_arns['clusterArns']

    async def _get_clusters(self) -> dict:
        describing_method = functools.partial(self.ecs_cli.describe_clusters,
                                              clusters=await self._get_cluster_arns())

        to_return = await self.fetch_and_process_async('clusterArn', describing_method)

        return to_return

    async def _get_service_arn_list(self, cluster_arn: str) -> list:
        response = await asyncio.to_thread(self.ecs_cli.list_services, cluster=cluster_arn)
        return response['serviceArns']

    async def _get_services(self, cluster_arn: str) -> dict:
        service_arn_list: list = await self._get_service_arn_list(cluster_arn)
        to_return = dict()
        if service_arn_list:
            describing_method = functools.partial(self.ecs_cli.describe_services,
                                                  cluster=cluster_arn,
                                                  services=service_arn_list)
            to_return = await self.fetch_and_process_async('serviceArn', describing_method)
        return to_return

    async def get_ecs_resources(self) -> dict:
        to_return = dict()
        clusters = await self._get_clusters()
        services = dict()
        for cluster_arn in clusters.keys():
            service = await self._get_services(cluster_arn)  # 병렬처리 가능
            services.update(service)
        to_return.update(clusters)
        to_return.update(services)
        return to_return
