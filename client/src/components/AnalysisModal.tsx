import styled from "styled-components";

interface IChartModal {
  selectedChart: JSX.Element;
  selected: string;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding-top: 30px;
`;
const ChartContainer = styled.div`
  display: flex;
  padding-top: 40px;
  width: auto;
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
const Info = styled.span`
  font-weight: lighter;
  font-size: 20px;
  color: white;
  line-height: 2em;
`;

const BarInfo = () => {
  return <></>;
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
  return <></>;
};

const DonutInfo = () => {
  return <></>;
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
