import styled from "styled-components";

interface IChartModal {
  selectedChart: JSX.Element;
  selected: string;
}

const Container = styled.div``;
const ChartContainer = styled.div``;
const InfoContainer = styled.div``;

const BarInfo = () => {
  return <></>;
};

const PolarInfo = () => {
  return <></>;
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
