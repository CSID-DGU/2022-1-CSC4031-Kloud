import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
const ChartBoxContainer = styled.div`
  display: flex;
`;
const ChartBox = styled.div`
  background-color: white;
  height: 200px;
  width: 200px;
`;
const Analysis = () => {
  return (
    <Container>
      <ChartBoxContainer>
        <ChartBox></ChartBox>
        <ChartBox></ChartBox>
      </ChartBoxContainer>
      <ChartBoxContainer>
        <ChartBox></ChartBox>
        <ChartBox></ChartBox>
      </ChartBoxContainer>
    </Container>
  );
};
export default Analysis;
