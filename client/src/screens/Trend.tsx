import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getProphetTrend } from "../api";
import Loader from "../components/Loader";
import PredictChart from "../components/PredictChart";
import InfoComponents from "../components/Info";
import ReactToolTip from "react-tooltip";

const Container = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const ChartAndInfoBox = styled.div`
  width: auto;
  height: auto;
  justify-content: center;
  align-items: center;
  display: flex;
`;
const InfoBox = styled.div`
  width: 240px;
  height: 521.739px;
  background-color: gray;
  margin-left: 50px;
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
`;
const InfoTitle = styled.span<{ marginBottom?: string }>`
  font-weight: lighter;
  font-size: 40px;
  color: white;
  margin-bottom: ${(props) =>
    props.marginBottom ? props.marginBottom : "10px"};
`;
const Info = styled.p<{ font?: string; color?: string }>`
  font-weight: lighter;
  font-size: ${(props) => (props.font ? props.font : "16px")};
  color: ${(props) => (props.color ? props.color : "white")};
  margin-bottom: 20px;
`;
const InfoLink = styled.a`
  font-weight: bold;
  font-size: 16px;
  color: white;
  margin-bottom: 20px;
  color: ${(props) => props.theme.bgColor};
`;
const UnitBox = styled.div`
  margin-bottom: 20px;
  display: flex;
`;
const Unit = styled.span<{ selected: boolean }>`
  color: ${(props) => (props.selected ? "yellow" : "white")};
  display: block;
  font-weight: lighter;
  font-size: 25px;
  margin: 0px 5px;
  border-bottom: ${(props) => (props.selected ? "0.8px solid yellow" : "none")};
  :hover {
    cursor: pointer;
  }
`;

const Trend = () => {
  // const { isLoading: isSimilarityLoading, data: similarityTrend } =
  //   useQuery<any>("similarity", getSimilarityTrend);
  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  const [unitDuration, setUnitDuration] = useState<string>("일");
  const onUnitClick = (selected: string) => {
    setUnitDuration(selected);
  };
  return (
    <>
      {isProphetLoading ? (
        <Loader />
      ) : (
        <Container>
          <InfoComponents
            contents={[
              "비용 예측 페이지입니다.",
              "과거 과금 패턴에 기반한 시계열 예측으로 단위 기간별 예측 비용을 제공합니다.",
            ]}
          />
          <ChartAndInfoBox>
            <div>
              {unitDuration === "일" ? (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.day}
                />
              ) : unitDuration === "주" ? (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.week}
                />
              ) : (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.month}
                />
              )}
            </div>
            <InfoBox>
              <UnitBox>
                <Unit
                  selected={unitDuration === "일"}
                  onClick={() => {
                    onUnitClick("일");
                  }}
                  data-tip
                  data-for="day"
                >
                  일별
                </Unit>
                <Unit
                  selected={unitDuration === "주"}
                  onClick={() => {
                    onUnitClick("주");
                  }}
                  data-tip
                  data-for="week"
                >
                  주별
                </Unit>
                <Unit
                  selected={unitDuration === "월"}
                  onClick={() => {
                    onUnitClick("월");
                  }}
                  data-tip
                  data-for="month"
                >
                  월별
                </Unit>
              </UnitBox>
              <InfoTitle data-tip data-for="performance">
                예측 SCORE
              </InfoTitle>
              <InfoTitle marginBottom={"50px"} data-tip data-for="performance">
                {prophetTrend.performance.toFixed(2)}
              </InfoTitle>
              <Info color={"yellow"} font={"20px"}>
                최근 한달간 비용{" "}
                {prophetTrend.day
                  .slice(-36, -5)
                  .map((d: any) => d[1].real_data)
                  .reduce((sum: number, val: number) => {
                    return sum + val;
                  }, 0)
                  .toFixed(1)}
                $
              </Info>
              <Info color={"yellow"} font={"20px"}>
                {unitDuration === "일"
                  ? `이후 5일 예측비용 ${prophetTrend.day
                      .slice(-5)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`
                  : unitDuration === "주"
                  ? `2주 예측비용 ${prophetTrend.week
                      .slice(-14)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`
                  : `다음달 예측비용 ${prophetTrend.month
                      .slice(-30)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`}
              </Info>
              <Info>녹색은 예측 데이터, 파란색은 실제 데이터입니다.</Info>
              <Info>
                회색 범위는 예측 오차를, 점선은 앞으로 5일 후의 비용 예측을
                나타냅니다.
              </Info>
              <Info>
                시계열 예측과 코사인 유사도를 이용해 과금 패턴을 예측합니다.
              </Info>
              <InfoLink
                href="https://facebook.github.io/prophet/"
                target="_blank"
              >
                무슨 라이브러리가 사용되나요?
              </InfoLink>
            </InfoBox>
          </ChartAndInfoBox>
          <ReactToolTip id="day" type="info">
            일별 트렌드를 반영해 이후 5일 간의 비용 예측을 제공합니다.
          </ReactToolTip>
          <ReactToolTip id="week" type="info">
            주별 트렌드를 반영해 이후 2주 간의 비용 예측을 제공합니다.
          </ReactToolTip>
          <ReactToolTip id="month" type="info">
            월별 트렌드를 반영해 다음 달의 비용 예측을 제공합니다.
          </ReactToolTip>
          <ReactToolTip id="performance" type="info">
            예측 SCORE는 최대 절댓값 평균 오분류 Maximum Mean Absolute
            Percentage Error 를 이용해 도출된 예측 정확도에 대한 평가
            지표입니다. 0~100 사이의 값을 가지며 0에 가까울수록 정확한
            예측값입니다.
          </ReactToolTip>
        </Container>
      )}
    </>
  );
};
export default Trend;
