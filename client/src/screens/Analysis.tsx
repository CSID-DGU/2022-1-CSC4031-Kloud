import { useState } from "react";
import styled from "styled-components";
import BarChart from "../components/AnalChartBar";
import DonutChart from "../components/AnalChartDonut";
import LineChart from "../components/AnalChartLine";
import PolarChart from "../components/AnalChartPolar";
import Loader from "../components/Loader";
import ModalFrame from "../components/Modal";
import AnalysisModal from "../components/AnalysisModal";
import Info from "../components/Info";
import { useQuery } from "react-query";
import {
  getTop3UsedAmount,
  getProphetTrend,
  getCostRatio,
  getCostHistory,
} from "../api";

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

const Analysis = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<JSX.Element>(<></>);
  const [selected, setSelected] = useState<string>("");
  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  const { isLoading: isRatioLoading, data: costRatio } = useQuery<any>(
    "ratio",
    getCostRatio
  );
  const { isLoading: isCostHistoryLoading, data: costHistory } = useQuery<any>(
    "costHistory",
    getCostHistory
  );
  const { isLoading: isTop3AmountLoading, data: top3Amount } = useQuery<any>(
    "top3",
    getTop3UsedAmount
  );

  return isRatioLoading ||
    isProphetLoading ||
    isCostHistoryLoading ||
    isTop3AmountLoading ? (
    <Loader />
  ) : (
    <Container>
      <Info
        contents={[
          "비용 분석 페이지입니다. 차트를 클릭하여 세부 내용 및 정보를 확인합니다.",
        ]}
      />
      <ChartBoxContainer>
        <ChartBox
          margin={130}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(
              <PolarChart modal={true} size={500} data={costRatio} />
            );
            setSelected("polar");
          }}
        >
          <PolarChart modal={false} size={440} data={costRatio} />
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(
              <BarChart modal={true} data={costHistory} size={480} />
            );
            setSelected("bar");
          }}
        >
          <BarChart modal={false} data={costHistory} size={510} />
        </ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox
          margin={130}
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(
              <LineChart
                modal={true}
                size={450}
                data={prophetTrend.day.slice(1, -5)}
                performance={prophetTrend.performance}
              />
            );
            setSelected("line");
          }}
        >
          <LineChart
            modal={false}
            size={480}
            data={prophetTrend.day.slice(1, -5)}
            performance={prophetTrend.performance}
          />
        </ChartBox>
        <ChartBox
          onClick={() => {
            setOpenModal((prev) => !prev);
            setSelectedChart(
              <DonutChart data={top3Amount} modal={true} size={400} />
            );
            setSelected("donut");
          }}
        >
          <DonutChart data={top3Amount} modal={false} size={430} />
        </ChartBox>
      </ChartBoxContainer>
      {openModal ? (
        <ModalFrame
          content={
            <AnalysisModal
              totalCost={selected === "polar" ? costRatio.at(-1) : null}
              selectedChart={selectedChart}
              selected={selected}
            />
          }
          handleModal={() => setOpenModal(false)}
        />
      ) : null}
    </Container>
  );
};
export default Analysis;
