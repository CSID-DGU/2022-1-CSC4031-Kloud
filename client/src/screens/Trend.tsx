import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { getProphetTrend, getSimilarityTrend } from "../api";
import Loader from "../components/Loader";

const Container = styled.div``;
const SelectorBox = styled.div``;
const Selector = styled.span``;
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
        <Container></Container>
      )}
    </>
  );
};
export default Trend;
