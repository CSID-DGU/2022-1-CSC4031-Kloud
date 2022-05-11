import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getProphetTrend, getSimilarityTrend } from "../api";
import Loader from "../components/Loader";
import PredictChart from "../components/PredictChart";

const Container = styled.div`
  width: auto;
  height: auto;
  justify-content: center;
  align-items: center;
  display: flex;
  padding-top: 50px;
`;
const Trend = () => {
  const { isLoading: isSimilarityLoading, data: similarityTrend } =
    useQuery<any>("similarity", getSimilarityTrend);

  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  return (
    <>
      {isProphetLoading || isSimilarityLoading ? (
        <Loader />
      ) : (
        <Container>
          <div>
            <PredictChart
              size="300%"
              similarity={{}}
              prophet={prophetTrend}
            ></PredictChart>
          </div>
        </Container>
      )}
    </>
  );
};
export default Trend;
