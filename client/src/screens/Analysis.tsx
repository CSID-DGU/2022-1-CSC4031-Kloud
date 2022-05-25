import { useState } from "react";
import styled from "styled-components";
import BarChart from "../components/AnalChartBar";
import DonutChart from "../components/AnalChartDonut";
import LineChart from "../components/AnalChartLine";
import PolarChart from "../components/AnalChartPolar";
import ModalFrame from "../components/Modal";
import AnalysisModal from "../components/AnalysisModal";

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
  :hover {
    cursor: pointer;
  }
`;

const Analysis = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<JSX.Element>(<></>);

  return (
    <Container>
      <ChartBoxContainer>
        <ChartBox
          margin={180}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<PolarChart modal={true} size={600}></PolarChart>);
          }}
        >
          <PolarChart modal={false} size={400}></PolarChart>
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<BarChart modal={true} size={600}></BarChart>);
          }}
        >
          <BarChart modal={false} size={350}></BarChart>
        </ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox
          margin={180}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<LineChart modal={true} size={600}></LineChart>);
          }}
        >
          <LineChart modal={false} size={350}></LineChart>
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<DonutChart modal={true} size={600}></DonutChart>);
          }}
        >
          <DonutChart modal={false} size={330}></DonutChart>
        </ChartBox>
      </ChartBoxContainer>
      {openModal ? (
        <ModalFrame
          content={<AnalysisModal selectedChart={selectedChart} />}
          handleModal={() => setOpenModal(false)}
        />
      ) : null}
    </Container>
  );
};
export default Analysis;
