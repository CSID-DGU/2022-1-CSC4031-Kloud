import boto3


general_session = boto3.Session(region_name="ap-northeast-2")
available_regions = general_session.get_available_regions(service_name="ec2") # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2가 기본값.


def create_session(access_key_id: str, secret_access_key: str, region: str) -> boto3.Session:
    return boto3.Session(aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key, region_name=region)


async def is_valid_session(session: boto3.Session) -> bool:
    test_client = session.client(service_name="ec2")
    test_client.describe_vpcs()  # 에러 발생시 예외처리하여 에러코드 보냄. todo 추후 수정
    return True


async def get_session_instance(access_key_id: str, secret_access_key: str) -> boto3.Session:
    return boto3.Session(aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key)


async def get_available_regions():
    return available_regions

