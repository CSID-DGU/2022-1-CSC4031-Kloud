import styled from "styled-components";
import SolutionChart from "../components/SolutionChart";
import Info from "../components/Info";
import HorizontalMenu from "../components/HorizontalMenu/index";
import { useState } from "react";
import SolutionCompareChart from "../components/SolutionCompareChart";
import {
  getCostRatio,
  getRightSizingRecommendation,
  getReservationRecommendation,
} from "../api";
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
  const { isLoading: isEC2ReservationLoading, data: EC2reservation } =
    useQuery<any>("EC2reservation", () => getReservationRecommendation("EC2"));
  const { isLoading: isRDSReservationLoading, data: RDSreservation } =
    useQuery<any>("RDSreservation", () => getReservationRecommendation("RDS"));
  const [selectedInfra, setSelectedInfra] = useState<any>();
  const [selectedInfraType, setSelectedInfraType] = useState<string>();
  const [recommendationType, setRecommendationType] = useState<string>();
  const onChartClick = (infra: any) => {
    setSelectedInfra(infra);
  };
  return (
    <>
      {isRecommendationLoading ||
      isRatioLoading ||
      isEC2ReservationLoading ||
      isRDSReservationLoading ? (
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
                {recommendation.length +
                  EC2reservation.RecommendationDetails.length +
                  RDSreservation.RecommendationDetails.length}
                개
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
                {(
                  parseFloat(
                    recommendation
                      .map(
                        (d: any) =>
                          d.ModifyRecommendationDetail.TargetInstances.at(0)
                            .EstimatedMonthlySavings
                      )
                      .reduce((sum: number, current: number) => sum + current)
                  ) +
                  parseFloat(
                    EC2reservation.RecommendationSummary
                      .TotalEstimatedMonthlySavingsAmount
                  ) +
                  parseFloat(
                    RDSreservation.RecommendationSummary
                      .TotalEstimatedMonthlySavingsAmount
                  )
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
                ...recommendation,
                ...EC2reservation.RecommendationDetails,
                ...RDSreservation.RecommendationDetails,
              ].map((infra: any, idx) => {
                if (idx < recommendation.length) {
                  return (
                    <ChartBox
                      onClick={() => {
                        onChartClick(infra);
                        setSelectedInfraType("EC2");
                        setRecommendationType("rightSizing");
                      }}
                    >
                      <SolutionChart
                        selected={selectedInfra === infra}
                        infra={"EC2"}
                        percent={
                          infra.CurrentInstance.ResourceDetails
                            .EC2ResourceDetails.HourlyOnDemandRate * 100
                        }
                      />
                    </ChartBox>
                  );
                } else if (
                  idx <
                  EC2reservation.RecommendationDetails.length +
                    recommendation.length
                ) {
                  return (
                    <ChartBox
                      onClick={() => {
                        onChartClick(infra);
                        setSelectedInfraType("EC2");
                        setRecommendationType("reservation");
                      }}
                    >
                      <SolutionChart
                        selected={selectedInfra === infra}
                        infra={"EC2"}
                        percent={Number(
                          parseFloat(infra.AverageUtilization).toFixed(2)
                        )}
                      />
                    </ChartBox>
                  );
                } else {
                  return (
                    <ChartBox
                      onClick={() => {
                        onChartClick(infra);
                        setSelectedInfraType("RDS");
                        setRecommendationType("reservation");
                      }}
                      key={infra}
                    >
                      <SolutionChart
                        selected={selectedInfra === infra}
                        infra={"RDS"}
                        percent={10}
                        key={infra}
                      />
                    </ChartBox>
                  );
                }
              })}
            />
            {selectedInfra && recommendationType === "rightSizing" ? (
              <SolutionContainer>
                <Info
                  contents={[
                    `${selectedInfraType}`,
                    selectedInfra.CurrentInstance.ResourceId,
                  ]}
                  direction={"left"}
                />
                <div>
                  <SolutionText color={"white"} size={"25px"}>
                    {
                      selectedInfra.CurrentInstance.ResourceDetails
                        .EC2ResourceDetails.InstanceType
                    }{" "}
                    인스턴스로 최근 한 달간 비용은
                  </SolutionText>
                  <SolutionText color={"yellow"} size={"30px"}>
                    $
                    {parseFloat(
                      selectedInfra.CurrentInstance.MonthlyCost
                    ).toFixed(2)}
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    입니다.
                  </SolutionText>
                </div>
                <div>
                  <SolutionText color={"white"} size={"25px"}>
                    시간 당 평균 인프라 가동률은
                  </SolutionText>
                  <SolutionText color={"orange"} size={"30px"}>
                    {(
                      parseFloat(
                        selectedInfra.CurrentInstance.ResourceDetails
                          .EC2ResourceDetails.HourlyOnDemandRate
                      ) * 100
                    ).toFixed(2)}
                    %,
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    최대 메모리 사용량은
                  </SolutionText>
                  <SolutionText color={"orange"} size={"30px"}>
                    {parseFloat(
                      selectedInfra.CurrentInstance.ResourceUtilization
                        .EC2ResourceUtilization.MaxCpuUtilizationPercentage
                    ).toFixed(2)}
                    %
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
                    {
                      selectedInfra.ModifyRecommendationDetail.TargetInstances.at(
                        0
                      ).ResourceDetails.EC2ResourceDetails.InstanceType
                    }
                  </SolutionText>
                  <SolutionText color={"white"} size={"25px"}>
                    로 사이즈 변경시 예상 절감 금액은
                  </SolutionText>
                  <SolutionText color={"yellowgreen"} size={"30px"}>
                    +
                    {parseFloat(
                      selectedInfra.ModifyRecommendationDetail.TargetInstances.at(
                        0
                      ).EstimatedMonthlySavings
                    ).toFixed(2)}
                    $
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
