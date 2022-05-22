RESOURCE_TYPE = {'VpcId': 'vpc',
                 'SubnetId': 'subnet',
                 'NetworkInterfaceId': 'network_interface',
                 'InternetGatewayId': 'igw',
                 'NatGatewayId': 'ngw',
                 'InstanceId': 'ec2',  # todo ec2 이외에도 InstanceId인 경우 있는지 확인할 것
                 'DBInstanceIdentifier': 'rds',
                 'LoadBalancerArn': 'elb',
                 'clusterArn': 'ecs_cluster',
                 'serviceArn': 'ecs_service'
                 }
GROUP_BY_DIMENSION = ["AZ", "INSTANCE_TYPE", "LEGAL_ENTITY_NAME", "INVOICING_ENTITY", "LINKED_ACCOUNT", "OPERATION",
                      "PLATFORM", "PURCHASE_TYPE", "SERVICE", "TENANCY", "RECORD_TYPE", "USAGE_TYPE"]
PARENT = {
    'subnet': 'VpcId',
    'ec2': 'SubnetId',
    'elb': 'VpcId',
    'ecs_service': 'clusterArn'
}
POSSIBLE_ROOT_NODES = {'vpc', 'ecs_cluster'}


def cut_useless_metadata(data: dict) -> list:  # todo 예외 있는지 확인
    processed = dict()
    for k, v in data.items():  # dict의 첫번째 값이 응답이고, 두번째가 메타데이터임.
        processed = v
        break
    return processed


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

