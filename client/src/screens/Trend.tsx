import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getProphetTrend } from "../api";
import Loader from "../components/Loader";
import PredictChart from "../components/PredictChart";
import InfoComponents from "../components/Info";
import ReactToolTip from "react-tooltip";

const Container = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const ChartAndInfoBox = styled.div`
  width: auto;
  height: auto;
  justify-content: center;
  align-items: center;
  display: flex;
`;
const InfoBox = styled.div`
  width: 240px;
  height: 521.739px;
  background-color: gray;
  margin-left: 50px;
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
`;
const InfoTitle = styled.span<{ marginBottom?: string; size?: string }>`
  font-weight: lighter;
  font-size: ${(props) => (props.size ? props.size : "40px")};
  color: white;
  margin-bottom: ${(props) =>
    props.marginBottom ? props.marginBottom : "10px"};
`;
const Info = styled.p<{ font?: string; color?: string }>`
  font-weight: lighter;
  font-size: ${(props) => (props.font ? props.font : "16px")};
  color: ${(props) => (props.color ? props.color : "white")};
  margin-bottom: 20px;
`;
const InfoLink = styled.a`
  font-weight: bold;
  font-size: 16px;
  color: white;
  margin-bottom: 20px;
  color: ${(props) => props.theme.bgColor};
`;
const UnitBox = styled.div`
  margin-bottom: 20px;
  display: flex;
`;
const Unit = styled.span<{ selected: boolean }>`
  color: ${(props) => (props.selected ? "yellow" : "white")};
  display: block;
  font-weight: lighter;
  font-size: 25px;
  margin: 0px 5px;
  border-bottom: ${(props) => (props.selected ? "0.8px solid yellow" : "none")};
  :hover {
    cursor: pointer;
  }
`;

const Trend = () => {
  // const { isLoading: isSimilarityLoading, data: similarityTrend } =
  //   useQuery<any>("similarity", getSimilarityTrend);
  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  const [unitDuration, setUnitDuration] = useState<string>("???");
  const onUnitClick = (selected: string) => {
    setUnitDuration(selected);
  };
  return (
    <>
      {isProphetLoading ? (
        <Loader />
      ) : (
        <Container>
          <InfoComponents
            contents={[
              "?????? ?????? ??????????????????.",
              "?????? ?????? ????????? ????????? ????????? ???????????? ?????? ????????? ?????? ????????? ???????????????.",
            ]}
          />
          <ChartAndInfoBox>
            <div>
              {unitDuration === "???" ? (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.day}
                />
              ) : unitDuration === "???" ? (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.week}
                />
              ) : (
                <PredictChart
                  size="300%"
                  selected={unitDuration}
                  prophet={prophetTrend.month}
                />
              )}
            </div>
            <InfoBox>
              <UnitBox>
                <Unit
                  selected={unitDuration === "???"}
                  onClick={() => {
                    onUnitClick("???");
                  }}
                  data-tip
                  data-for="day"
                >
                  ??????
                </Unit>
                <Unit
                  selected={unitDuration === "???"}
                  onClick={() => {
                    onUnitClick("???");
                  }}
                  data-tip
                  data-for="week"
                >
                  ??????
                </Unit>
                <Unit
                  selected={unitDuration === "???"}
                  onClick={() => {
                    onUnitClick("???");
                  }}
                  data-tip
                  data-for="month"
                >
                  ??????
                </Unit>
              </UnitBox>
              <InfoTitle data-tip data-for="performance" size={"30px"}>
                mMAPE SCORE
              </InfoTitle>
              <InfoTitle marginBottom={"50px"} data-tip data-for="performance">
                {prophetTrend.performance.toFixed(2)}
              </InfoTitle>
              <Info color={"yellow"} font={"20px"}>
                ?????? ????????? ??????{" "}
                {prophetTrend.day
                  .slice(-36, -5)
                  .map((d: any) => d[1].real_data)
                  .reduce((sum: number, val: number) => {
                    return sum + val;
                  }, 0)
                  .toFixed(1)}
                $
              </Info>
              <Info color={"yellow"} font={"20px"}>
                {unitDuration === "???"
                  ? `?????? 5??? ???????????? ${prophetTrend.day
                      .slice(-5)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`
                  : unitDuration === "???"
                  ? `2??? ???????????? ${prophetTrend.week
                      .slice(-14)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`
                  : `????????? ???????????? ${prophetTrend.month
                      .slice(-30)
                      .map((d: any) => d[1].expected_data.yhat)
                      .reduce((sum: number, val: number) => {
                        if (val < 0) val = 0;
                        return sum + val;
                      }, 0)
                      .toFixed(1)}$`}
              </Info>
              <Info>????????? ?????? ?????????, ???????????? ?????? ??????????????????.</Info>
              <Info>
                ?????? ????????? ?????? ?????????, ????????? ????????? 5??? ?????? ?????? ?????????
                ???????????????.
              </Info>
              <Info>
                ????????? ????????? ????????? ???????????? ????????? ?????? ????????? ???????????????.
              </Info>
              <InfoLink
                href="https://facebook.github.io/prophet/"
                target="_blank"
              >
                ?????? ?????????????????? ????????????????
              </InfoLink>
            </InfoBox>
          </ChartAndInfoBox>
          <ReactToolTip id="day" type="info">
            ?????? ???????????? ????????? ?????? 5??? ?????? ?????? ????????? ???????????????.
          </ReactToolTip>
          <ReactToolTip id="week" type="info">
            ?????? ???????????? ????????? ?????? 2??? ?????? ?????? ????????? ???????????????.
          </ReactToolTip>
          <ReactToolTip id="month" type="info">
            ?????? ???????????? ????????? ?????? ?????? ?????? ????????? ???????????????.
          </ReactToolTip>
          <ReactToolTip id="performance" type="info">
            ?????? SCORE??? ?????? ????????? ?????? ????????? Maximum Mean Absolute
            Percentage Error ??? ????????? ????????? ?????? ??????????????? ?????? ??????
            ???????????????. 0~100 ????????? ?????? ????????? 0??? ??????????????? ?????????
            ??????????????????.
          </ReactToolTip>
        </Container>
      )}
    </>
  );
};
export default Trend;
