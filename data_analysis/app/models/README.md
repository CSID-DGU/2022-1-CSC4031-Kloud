# data_analysis.app.models
정상성을 띄지 않는 시계열 데이터를 분석하기 위한 모델 경로입니다.

## PatternFinder.py
- Cosine-Similarity 기반 과금 추이 예측 모델
  - 이전 30일 간의 시계열 Data Vector들을 기반으로 Vector 유사도 값(Threshold)이 0.95 이상인 경우만 추출
  - 추후 5일의 추이를 예측.
  - 클라우드 서비스 과금 특성상 대부분 단조로운 형태를 띄기때문에 본 방법론은 후보군으로 설정하였다.

## ProphetPatternFinder.py
- Meta(구 FaceBook)에서 개발한 시계열 데이터 분석 라이브러리 Prophet
  - 클라우드 서비스를 사용 함으로서 발생되는 과금 데이터는 추세나 계절성을 띄는, 즉 정상성(Stationarity)을 나타내는 시계열이 아님을 확인
  - 계절성을 띄는 시계열 데이터를 위해 Meta(구 Facebook)에서 공개한 시계열 예측 라이브러리 채택.
  - Prophet 모델의 주요 구성요소로는 Trend, Seasonality, Holiday이다. 이 세가지를 결합하면 아래와 같이 나타낼 수 있다.
  
     ![image](https://user-images.githubusercontent.com/73048180/174269058-35af9414-0d51-416a-bad6-22eec2eb603c.png)


  - Trend를 구성하는 g(t)함수는 주기적이지 않은 변화인 트렌드를 나타낸다.
  - Seasonality인 s(t)함수는 weekly, yearly 등 주기적으로 나타나는 패턴들을 포함한다.
  - Holiday를 나타내는 h(t)함수는 휴일과 같이 불규칙한 이벤트 들을 나타낸다.
  - 만약 특정 기간에 값이 비정상적으로 증가, 또는 감소했다면 holiday로 정의하여 모델에 반영할 수 있다.
  - ε는 정규분포로 가정한 오차이다.
- Prophet을 이용한 모델로 일별, 주별 트렌드를 적용시켜 약 과거 90일의 과금 데이터의 단위 기간별(일, 주, 월)비용 예측 그래프를 생성하였다. 


- Prophet 모델 성능 평가
  -  모델 성능평가를 위해 “최대 절댓값 기반 시계열 데이터 예측 모델 평가 기법” mMAPE 적용
    - MAPE
        ![image](https://user-images.githubusercontent.com/73048180/174269011-3005dc6e-4ff8-4f92-a22a-96cd3a149669.png)

        - 예측 관측값이 클수록 100에 가까운수가 측정, 차이가 적을수록 0에 가까운 값 측정
        - ⇒ 값이 작아지면 과대하게 평가 값이 측정됨
    - sMAPE
        ![image](https://user-images.githubusercontent.com/73048180/174268749-6398622e-79be-4b86-8693-efac3529b6c7.png)
  
        - MAPE와 달리 관측 값과 예측 값이 절대 값의 평균으로 대체
        - 관측 값과 예측 값이 부호가 다를 경우에는 실제 차이 정도와 상관없이 항상 최대 에러 값을 보임
        - ⇒ 전체 모델 평가의 의미를 훼손하는 결과를 가져오게 된다.
    - mMAPE
        ![image](https://user-images.githubusercontent.com/73048180/174268920-5f6f160a-20b3-4462-adc4-b02b0720c7eb.png)

        - 평가 값은 계산할 때 분모에 〖|A|〗_max 값을 사용함으로써 평가 값이 0과 100사이의 숫자로 계산.
        - 특정 시점에 예측 데이터가 터무니 없이 커서 최댓값보다 클 경우는 100 이상의 값이 부여되게 되어 모델 평가 값에 다른 경우보다 더 큰 영향을 미치게 됨
        - ⇒ 이 경우 상당히 잘못된 예측을 한 경우로 판단될 수 있음.

