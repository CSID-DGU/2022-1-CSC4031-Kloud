import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getProphetTrend, getSimilarityTrend } from "../api";
import Loader from "../components/Loader";
import PredictChart from "../components/PredictChart";

const Container = styled.div`
  width: auto;
  height: auto;
  justify-content: center;
  align-items: center;
  display: flex;
  padding-top: 50px;
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
const Info = styled.p`
  font-weight: lighter;
  font-size: 16px;
  color: white;
  margin-bottom: 20px;
`;
const InfoLink = styled.a`
  font-weight: bold;
  font-size: 16px;
  color: white;
  margin-bottom: 20px;
  color: ${(props) => props.theme.bgColor};
`;
const Trend = () => {
  const { isLoading: isSimilarityLoading, data: similarityTrend } =
    useQuery<any>("similarity", getSimilarityTrend);

  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  return (
    <>
      {isProphetLoading || isSimilarityLoading ? (
        <Loader />
      ) : (
        <Container>
          <div>
            <PredictChart
              size="300%"
              similarity={{}}
              prophet={prophetTrend}
            ></PredictChart>
          </div>
          <InfoBox>
            <InfoTitle>예측 정확도</InfoTitle>
            <InfoTitle marginBottom={"110px"}>78%</InfoTitle>
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
        </Container>
      )}
    </>
  );
};
export default Trend;
