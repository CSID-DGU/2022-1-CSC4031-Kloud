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
  margin-top: 30px;
  :hover {
    cursor: pointer;
  }
`;
const InfoBox = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
`;
const Info = styled.span`
  color: white;
  font-weight: lighter;
  font-size: 30px;
`;

const Analysis = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<JSX.Element>(<></>);
  const [selected, setSelected] = useState<string>("");

  return (
    <Container>
      <InfoBox>
        <Info>
          비용 분석 페이지입니다. 차트를 클릭하여 세부 내용 및 정보를
          확인합니다.
        </Info>
      </InfoBox>
      <ChartBoxContainer>
        <ChartBox
          margin={130}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<PolarChart modal={true} size={480}></PolarChart>);
            setSelected("polar");
          }}
        >
          <PolarChart modal={false} size={400}></PolarChart>
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<BarChart modal={true} size={450}></BarChart>);
            setSelected("bar");
          }}
        >
          <BarChart modal={false} size={480}></BarChart>
        </ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox
          margin={130}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<LineChart modal={true} size={450}></LineChart>);
            setSelected("line");
          }}
        >
          <LineChart modal={false} size={480}></LineChart>
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(<DonutChart modal={true} size={400}></DonutChart>);
            setSelected("donut");
          }}
        >
          <DonutChart modal={false} size={430}></DonutChart>
        </ChartBox>
      </ChartBoxContainer>
      {openModal ? (
        <ModalFrame
          content={
            <AnalysisModal selectedChart={selectedChart} selected={selected} />
          }
          handleModal={() => setOpenModal(false)}
        />
      ) : null}
    </Container>
  );
};
export default Analysis;
