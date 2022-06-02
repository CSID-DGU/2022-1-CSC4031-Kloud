import styled from "styled-components";
import SolutionChart from "../components/SolutionChart";
import Info from "../components/Info";
import HorizontalMenu from "../components/HorizontalMenu/index";
import { useState } from "react";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const SolutionBox = styled.div`
  width: 85vw;
  height: 82vh;
  border-radius: 10px;
  background-color: transparent;
  display: flex;
`;
const ChartBox = styled.div`
  height: 100%;
  width: 37vw;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-right: -100px;
  margin-left: -120px;
  :hover {
    cursor: pointer;
  }
`;

const CompareSection = styled.div`
  width: 100%;
  height: 90px;
  display: flex;
  padding: 0 90px;
  justify-content: space-between;
  border-top: 0.3px solid white;
`;
const CompareBox = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: column;
`;
const CompareText = styled.span<{
  color: string;
  size: string;
  weight?: string;
}>`
  color: ${(props) => props.color};
  font-size: ${(props) => props.size};
  font-weight: ${(props) => (props.weight ? props.weight : "lighter")};
  margin-top: 10px;
`;

const Solution = () => {
  const [selectedInfra, setSelectedInfra] = useState<string>();
  const onChartClick = (infra: string) => {
    setSelectedInfra(infra);
  };
  return (
    <Container>
      <Info
        contents={[
          "비용 솔루션 페이지입니다.",
          "인프라 사용량에 근거하여 비용 솔루션을 제시합니다.",
        ]}
      />
      <CompareSection>
        <CompareBox>
          <CompareText weight={"normal"} color={"white"} size={"25px"}>
            최근 한달 비용
          </CompareText>
          <CompareText color={"yellow"} size={"25px"}>
            32.3$
          </CompareText>
          <CompareText color={"white"} size={"15px"}>
            최근 한달간의 전체 비용입니다.
          </CompareText>
        </CompareBox>
        <CompareBox>
          <CompareText weight={"normal"} color={"white"} size={"25px"}>
            솔루션 제안 인프라
          </CompareText>
          <CompareText color={"red"} size={"25px"}>
            4개
          </CompareText>
          <CompareText color={"white"} size={"15px"}>
            Kloud 에서 제안하는 변경사항에 해당하는 인프라의 개수입니다.
          </CompareText>
        </CompareBox>
        <CompareBox>
          <CompareText weight={"normal"} color={"white"} size={"25px"}>
            절감 가능 금액
          </CompareText>
          <CompareText color={"yellowgreen"} size={"25px"}>
            5.03$ &darr;
          </CompareText>
          <CompareText color={"white"} size={"15px"}>
            한달 동안 절감 가능한 최대 금액입니다.
          </CompareText>
        </CompareBox>
      </CompareSection>
      <SolutionBox>
        <HorizontalMenu
          contents={[
            <ChartBox onClick={() => onChartClick("testing")}>
              <SolutionChart infra={"RDS1"} percent={20} />
            </ChartBox>,
            <ChartBox onClick={() => onChartClick("testing")}>
              <SolutionChart infra={"EC2"} percent={34} />
            </ChartBox>,
            <ChartBox onClick={() => onChartClick("testing")}>
              <SolutionChart infra={"EC2"} percent={22} />
            </ChartBox>,
            <ChartBox onClick={() => onChartClick("testing")}>
              <SolutionChart infra={"EC2"} percent={15} />
            </ChartBox>,
          ]}
        />
      </SolutionBox>
    </Container>
  );
};
export default Solution;
