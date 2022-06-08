# Kloud
### Cloud Visualization And Cost Optimization Service
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://www.olis.or.kr/license/Detailselect.do?lId=1006)

[Kloud Demo](https://kloud.prvt.dev), [Kloud API Demo](https://api.kloud.prvt.dev)

![ServiceStructure](https://github.com/kshshkim/2022-1-CSC4031-Kloud/blob/main/miscs/service_structure.png)

클라우드 인프라 시각화 및, 비용 분석 및 예측, 관리 서비스를 제공합니다. 

AWS IAM 으로 AWS API에 접근합니다. (IAM 정보는 서버에 저장되지 않으며, AWS STS를 통해 발급 받은 임시 토큰이 Redis에 저장됩니다.)

## Server
- FastAPI를 기반으로 하는 웹 애플리케이션 서버로, 컨테이너 기반 배포와 Scale-Out을 고려하였습니다.
- 메시지 브로커와 In-Memory DB로 Redis를 사용합니다. AWS SDK Boto3를 통해 AWS API 요청 등 I/O-Bound 작업을 비동기로 처리합니다.
- Redis를 통해 Celery와 통신합니다.

## Data Analysis
- Celery 기반 데이터 분석 워커입니다. CPU-Bound 작업을 서버와 비동기로 처리합니다. Scale-Out 가능합니다.
- fbprophet 라이브러리를 통하여 비용 예측 서비스를 구현하였습니다.
