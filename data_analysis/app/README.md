# server.app
시계열 Data-Analysis 애플리케이션 경로입니다.

## models
[README](/data_analysis/app/models/README.md)
- 시계열 데이터 분석을 위한 모델정보가 있습니다
- Cosine-Similarity 기반 모델
- Prophet 기반 모델



## conf
[README](/data_analysis/app/conf/README.md)

## da_tasks.py
- FastAPI app 객체 선언, CORS 정책 설정, *routers* 패키지 아래의 라우터 객체 포함 등이 이루어집니다.
- Data 분석을위한 Task가 작성 되어있습니다. 
- 이전 과금데이터 추이를 기반으로 미래 과금 데이터 추이를 예측합니다.
- Cosine-Similarity 기반 과금 추이 분석
- Prophet 기반 과금 추이 분석
  
  - Cosine-Similarity 기반 과금 추이 예측은 이전 30일 간의 시계열 Data Vector들을 기반으로 Vector 유사도 값(Threshold)이 0.95 이상인 경우만 추출
  - 추후 5일의 추이를 예측
  - 클라우드 서비스 과금 특성상 대부분 단조로운 형태를 띄기때문에 본 방법론은 후보군으로 설정하였다.

## da_worker.py
- 시간이 오래 걸리는 데이터 분석 연산 작업은 Background 에서 진행
- Celery를 통해 분산 메시징을 위한 비동기 작업 큐 생성
- 웹서비스 사용자가 느끼는 웹 지연을 최소화하기위해 무거운 Task는 비동기 큐로 옮겨 지연시간을 최소화한다.

## request.py
- AWS 클라우드 서비스를 이용하는 사용자의 과금 비용에 대한 Raw-Data를 반환한다.
