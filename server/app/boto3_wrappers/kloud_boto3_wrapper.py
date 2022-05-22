import asyncio

import boto3

from .common_funcs import cut_useless_metadata, RESOURCE_TYPE


class KloudBoto3Wrapper:
    def __init__(self, session_instance: boto3.Session):
        self.session = session_instance

    @staticmethod
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

    @staticmethod
    async def fetch_and_process_async(identifier, describing_method) -> dict:
        res = await asyncio.to_thread(KloudBoto3Wrapper.fetch_and_process, identifier, describing_method)
        return res
