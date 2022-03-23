# boto3 sdk 관련 기능
import botocore.exceptions
import boto3


general_session = boto3.Session()
available_regions = general_session.get_available_regions(service_name="ec2") # 가능한 aws 지역 목록, 가장 기본적이고 보편적인 서비스인 ec2가 기본값.


async def is_valid_access_key(access_key_id: str, secret_access_key: str) -> bool:
    test_client = boto3.client(aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key, service_name="ec2")
    try:
        test_client.describe_account_attributes()
    except botocore.exceptions.ClientError:
        return False

    return True


async def get_session_instance(access_key_id: str, secret_access_key: str) -> boto3.Session:
    if await is_valid_access_key(access_key_id=access_key_id, secret_access_key=secret_access_key):
        return boto3.Session(aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key)
    else:
        raise "invalid_access_key"


async def get_available_regions():
    return available_regions
