import styled from "styled-components";

interface IChartModal {
  selectedChart: JSX.Element;
}

const Container = styled.div``;
const ChartContainer = styled.div``;

const AnalysisModal = ({ selectedChart }: IChartModal) => {
  return (
    <Container>
      <ChartContainer>{selectedChart}</ChartContainer>
    </Container>
  );
};

export default AnalysisModal;
