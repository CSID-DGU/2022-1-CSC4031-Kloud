import { useState } from "react";
import styled from "styled-components";

interface IChartModal {
  selectedChart: JSX.Element;
  selected: string;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding-top: 50px;
`;
const ChartContainer = styled.div`
  display: flex;
  padding-top: 40px;
  width: 900px;
`;
const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  padding: 30px;
`;
const InfoTitle = styled.p`
  font-weight: lighter;
  font-size: 30px;
  color: yellow;
  margin-bottom: 35px;
`;
const Info = styled.span<{ textColor?: string }>`
  font-weight: lighter;
  font-size: 20px;
  color: ${(props) => (props.textColor ? props.textColor : "white")};
  line-height: 2em;
  :hover {
    cursor: default;
  }
`;
const InfoHoverContainer = styled.div`
  background-color: gainsboro;
  width: 400px;
  height: 300px;
  position: fixed;
  border-radius: 30px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const InfoHoverText = styled.span`
  font-weight: lighter;
  font-size: 18px;
  color: black;
  line-height: 2em;
  display: block;
`;

const BarInfo = () => {
  return (
    <>
      <InfoTitle>인프라별 지출 내역</InfoTitle>
      <Info>
        이 차트는 최근 2주 간의 비용에 대한 서비스별 세부 비용 내역을
        나타냅니다.
      </Info>
      <Info>차트 상단의 툴바 혹은 드래그를 통해 차트를 확대 / 축소합니다.</Info>
    </>
  );
};

const PolarInfo = () => {
  return (
    <>
      <InfoTitle>인프라별 지출 비용</InfoTitle>
      <Info>
        이 차트는 최근 한 달 지출에 대한 서비스별 지출 비율을 나타냅니다.
      </Info>
      <Info>마우스를 올려 해당 인프라를 직관적으로 확인합니다.</Info>
    </>
  );
};

const LineInfo = () => {
  return (
    <>
      <InfoTitle>전체 비용 차트</InfoTitle>
      <Info>
        전체 인프라에 대한 AWS 지출 내역입니다. 실 결제 금액을 기준으로
        반영합니다.
      </Info>
      <Info> 상단 툴바, 또는 드래그를 통해 확대해 세부 내역을 확인합니다.</Info>
    </>
  );
};

const DonutInfo = () => {
  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <>
      <InfoTitle>인프라별 사용률</InfoTitle>
      <Info>
        이 차트는 인프라별 사용률을 나타냅니다. EC2, ECS, RDS, S3 에 대한
        사용률을 확인합니다.
      </Info>
      <Info
        textColor="black"
        onMouseOver={() => setIsHover((prev) => !prev)}
        onMouseLeave={() => setIsHover((prev) => !prev)}
      >
        무슨 기준으로 사용량을 측정하나요? &rarr;
      </Info>
      {isHover ? (
        <InfoHoverContainer>
          <InfoHoverText>
            EC2 &rarr; CPU 평균 사용량을 측정합니다.
          </InfoHoverText>
          <InfoHoverText>
            ECS &rarr; 메모리 평균 사용량을 측정합니다.
          </InfoHoverText>
          <InfoHoverText>
            RDS, S3 &rarr; 남은 저장 공간을 측정합니다.
          </InfoHoverText>
        </InfoHoverContainer>
      ) : null}
    </>
  );
};

const AnalysisModal = ({ selectedChart, selected }: IChartModal) => {
  return (
    <Container>
      <ChartContainer>{selectedChart}</ChartContainer>
      <InfoContainer>
        {selected === "polar" ? (
          <PolarInfo />
        ) : selected === "line" ? (
          <LineInfo />
        ) : selected === "donut" ? (
          <DonutInfo />
        ) : (
          <BarInfo />
        )}
      </InfoContainer>
    </Container>
  );
};

export default AnalysisModal;
