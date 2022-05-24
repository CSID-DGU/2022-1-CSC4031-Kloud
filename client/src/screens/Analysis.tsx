import { useState } from "react";
import styled from "styled-components";
import BarChart from "../components/AnalChartBar";
import DonutChart from "../components/AnalChartDonut";
import LineChart from "../components/AnalChartLine";
import PolarChart from "../components/AnalChartPolar";
import ModalFrame from "../components/Modal";

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
  return (
    <Container>
      <ChartBoxContainer>
        <ChartBox margin={180} onClick={() => setOpenModal((prev) => !prev)}>
          <PolarChart size={400}></PolarChart>
        </ChartBox>
        <ChartBox onClick={() => setOpenModal((prev) => !prev)}>
          <BarChart size={20}></BarChart>
        </ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox margin={180} onClick={() => setOpenModal((prev) => !prev)}>
          <LineChart size={20}></LineChart>
        </ChartBox>
        <ChartBox onClick={() => setOpenModal((prev) => !prev)}>
          <DonutChart size={20}></DonutChart>
        </ChartBox>
      </ChartBoxContainer>
      {openModal ? (
        <ModalFrame content={<></>} handleModal={() => setOpenModal(false)} />
      ) : null}
    </Container>
  );
};
export default Analysis;
