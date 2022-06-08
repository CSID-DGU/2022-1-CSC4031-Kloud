import styled from "styled-components";
import SolutionChart from "../components/SolutionChart";
import Info from "../components/Info";
import HorizontalMenu from "../components/HorizontalMenu/index";
import { useState } from "react";
import SolutionCompareChart from "../components/SolutionCompareChart";
import { getCostRatio, getRightSizingRecommendation } from "../api";
import Loader from "../components/Loader";
import { useQuery } from "react-query";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const SolutionBox = styled.div`
  width: 85vw;
  background-color: transparent;
  display: flex;
  flex-direction: column;
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

const SolutionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 90px;
  margin-bottom: 100px;
`;
const SolutionText = styled.span<{ size: string; color: string }>`
  font-weight: lighter;
  font-size: ${(props) => props.size};
  color: ${(props) => props.color};
  margin-right: 8px;
`;

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Solution = () => {
  const { isLoading: isRecommendationLoading, data: recommendation } =
    useQuery<any>("recommendation", getRightSizingRecommendation);
  const { isLoading: isRatioLoading, data: costRatio } = useQuery<any>(
    "ratio",
    getCostRatio
  );
  const [selectedInfra, setSelectedInfra] = useState<string>();
  const onChartClick = (infra: string) => {
    setSelectedInfra(infra);
  };
  return (
    <>
      {isRecommendationLoading ? (
        <Loader />
      ) : (
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
                ${costRatio.at(-1)}
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
                {recommendation.length}개
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
                $
                {parseFloat(
                  recommendation
                    .map(
                      (d: any) =>
                        d.ModifyRecommendationDetail.TargetInstances.at(0)
                          .EstimatedMonthlySavings
                    )
                    .reduce((sum: number, current: number) => sum + current)
                ).toFixed(2)}{" "}
                &darr;
              </CompareText>
              <CompareText color={"white"} size={"15px"}>
                한달 동안 절감 가능한 최대 금액입니다.
              </CompareText>
            </CompareBox>
          </CompareSection>
          <SolutionBox>
            <HorizontalMenu
              contents={[
                <ChartBox onClick={() => onChartClick("RDS1")}>
                  <SolutionChart
                    selected={selectedInfra === "RDS1"}
                    infra={"RDS1"}
                    percent={20}
                  />
                </ChartBox>,
                <ChartBox onClick={() => onChartClick("EC2-1")}>
                  <SolutionChart
                    selected={selectedInfra === "EC2-1"}
                    infra={"EC2"}
                    percent={34}
                  />
                </ChartBox>,
                <ChartBox onClick={() => onChartClick("EC2-2")}>
                  <SolutionChart
                    selected={selectedInfra === "EC2-2"}
                    infra={"EC2"}
                    percent={22}
                  />
                </ChartBox>,
                <ChartBox onClick={() => onChartClick("EC2-3")}>
                  <SolutionChart
                    selected={selectedInfra === "EC2-3"}
                    infra={"EC2"}
                    percent={15}
                  />
                </ChartBox>,
              ]}
            />
            {selectedInfra ? (
              <SolutionContainer>
                <Info
                  contents={[`${selectedInfra}`, "i-02f892f88345aad41"]}
                  direction={"left"}
                />
                <div>
                  <SolutionText color={"white"} size={"25px"}>
                    t2.micro 인스턴스로 최근 한 달간 비용은
                  </SolutionText>
                  <SolutionText color={"yellow"} size={"30px"}>
                    16.4$
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    입니다.
                  </SolutionText>
                </div>
                <ChartContainer>
                  <SolutionCompareChart />
                </ChartContainer>
                <div>
                  <SolutionText color={"yellow"} size={"25px"}>
                    t2.nano
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    로 사이즈 변경시 예상 절감 금액은
                  </SolutionText>
                  <SolutionText color={"yellowgreen"} size={"30px"}>
                    +4.3$
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    입니다.
                  </SolutionText>
                </div>
              </SolutionContainer>
            ) : null}
          </SolutionBox>
        </Container>
      )}
    </>
  );
};
export default Solution;
