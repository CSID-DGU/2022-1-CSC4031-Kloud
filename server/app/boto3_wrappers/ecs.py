import boto3
from .kloud_boto3_wrapper import KloudBoto3Wrapper


class KloudECS(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self.ecs_cli = session_instance.client("ecs", region_name="ap-northeast-2")

    def _get_cluster_arns(self) -> list:
        return self.ecs_cli.list_clusters()['clusterArns']

    def _get_clusters(self) -> dict:
        to_return = dict()
        described_clusters = self.ecs_cli.describe_clusters(clusters=self._get_cluster_arns())['clusters']
        for cluster in described_clusters:
            cluster_name = cluster['clusterArn']
            cluster['resource_type'] = 'ecs_cluster'
            to_return[cluster_name] = cluster
        return to_return

    def _get_service_arn_list(self, cluster_arn: str) -> list:
        list_services = self.ecs_cli.list_services(cluster=cluster_arn)['serviceArns']
        return list_services

    def _get_services(self, cluster_arn: str) -> dict:
        service_arn_list = self._get_service_arn_list(cluster_arn)
        to_return = dict()
        if service_arn_list:
            service_list = self.ecs_cli.describe_services(cluster=cluster_arn, services=service_arn_list)['services']
            for service in service_list:
                service['resource_type'] = 'ecs_service'
                to_return[service['serviceArn']] = service
        return to_return

    def get_ecs_resources(self) -> dict:
        to_return = dict()
        clusters = self._get_clusters()
        services = dict()
        for cluster_arn in clusters.keys():
            service = self._get_services(cluster_arn)  # 병렬처리 가능
            services.update(service)
        to_return.update(clusters)
        to_return.update(services)
        return to_return
