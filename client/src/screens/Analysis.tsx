import styled from "styled-components";
import BarChart from "../components/AnalChartBar";
import DonutChart from "../components/AnalChartDonut";
import LineChart from "../components/AnalChartLine";
import PolarChart from "../components/AnalChartPolar";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: auto;
  height: auto;
  padding-top: 18px;
`;
const ChartBoxContainer = styled.div`
  display: flex;
  height: auto;
`;
const ChartBox = styled.div<{ margin?: number }>`
  height: auto;
  width: auto;
  margin-right: ${(props) => (props.margin ? props.margin : 0)}px;
  margin-top: 10px;
`;
const Analysis = () => {
  return (
    <Container>
      <ChartBoxContainer>
        <ChartBox margin={90}>
          <PolarChart size={430}></PolarChart>
        </ChartBox>
        <ChartBox>
          <BarChart size={430}></BarChart>
        </ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox margin={90}>
          <LineChart size={430}></LineChart>
        </ChartBox>
        <ChartBox>
          <DonutChart size={430}></DonutChart>
        </ChartBox>
      </ChartBoxContainer>
    </Container>
  );
};
export default Analysis;
