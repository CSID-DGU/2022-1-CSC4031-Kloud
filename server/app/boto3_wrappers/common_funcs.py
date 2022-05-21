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
    'ecs_service': 'ecs_cluster'
}
POSSIBLE_ROOT_NODES = {'vpc'}


def cut_useless_metadata(data: dict) -> list:  # todo 예외 있는지 확인
    processed = dict()
    for k, v in data.items():  # dict의 첫번째 값이 응답이고, 두번째가 메타데이터임.
        processed = v
        break
    return processed


def fetch_and_process(identifier, describing_method) -> dict:  # 응답을 받아서 후처리함.
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

