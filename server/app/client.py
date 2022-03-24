import boto3


identifiers = ['InternetGatewayId', 'VpcId', 'InternetGateways', 'LocalGateways', 'NetworkInterfaces']


class KloudClient:
    def __init__(self, access_key_id: str, session_instance: boto3.Session, ):
        self.id = access_key_id
        self._session = session_instance
        self._ec2_client = session_instance.client(service_name="ec2")
        self._resources = dict()
        self._describing_methods = {'VpcId': self._ec2_client.describe_vpcs,
                                    # 'ZoneName': self._ec2_client.describe_availability_zones,
                                    'SubnetId': self._ec2_client.describe_subnets,
                                    'NetworkInterfaceId': self._ec2_client.describe_network_interfaces,
                                    'InternetGatewayId': self._ec2_client.describe_internet_gateways,
                                    'NatGatewayId': self._ec2_client.describe_nat_gateways}

    async def _update_resource_dict(self) -> None:
        for identifier, describing_method in self._describing_methods.items():
            response: dict = self.cut_useless_metadata(describing_method())
            for dic in response:
                primary_key = dic[identifier]
                self._resources[primary_key] = dic

    @staticmethod
    def cut_useless_metadata(data: dict) -> dict:
        processed = dict()
        for k, v in data.items():
            processed = v
            break
        return processed

    async def get_current_infra_dict(self) -> dict:
        await self._update_resource_dict()
        return self._resources