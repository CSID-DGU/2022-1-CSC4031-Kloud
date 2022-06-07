import asyncio
import datetime

import boto3

from .kloud_boto3_wrapper import KloudBoto3Wrapper


class KloudCloudWatch(KloudBoto3Wrapper):
    def __init__(self, session_instance: boto3.Session):
        super().__init__(session_instance)
        self._cw_cli = self.session.client("cloudwatch")

    def _get_resource_utilization(self, resource_id: str) -> float:
        cpu_data = self._cw_cli.get_metric_statistics(
            Namespace="AWS/EC2",
            MetricName="CPUUtilization",
            Dimensions=[
                {
                    "Name": "InstanceId",
                    "Value": resource_id
                }
            ],
            StartTime=datetime.datetime.now() - datetime.timedelta(days=14),
            EndTime=datetime.datetime.now(),
            Period=86400 * 14,
            Statistics=["Average"],
            Unit="Percent"
        )
        return cpu_data['Datapoints'][0]['Average']

    async def async_get_resource_utilization(self, resource_id: str) -> float:
        return await asyncio.to_thread(self._get_resource_utilization, resource_id=resource_id)
