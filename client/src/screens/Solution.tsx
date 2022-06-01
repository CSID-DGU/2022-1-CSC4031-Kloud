import styled from "styled-components";
import SolutionChart from "../components/SolutionChart";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 20px;
`;
const SolutionBox = styled.div`
  width: 75vw;
  height: 72vh;
  border-radius: 10px;
  background-color: gray;
  display: flex;
  justify-content: space-space-between;
`;
const Partition = styled.div<{ partitionWidth: string }>`
  width: ${(props) => props.partitionWidth};
`;
const ChartBox = styled.div`
  height: 100%;
  width: 37vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SolutionTextBox = styled.div`
  height: 100%;
  width: 37vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SolutionTitle = styled.p`
  font-size: 30px;
  color: white;
  font-weight: lighter;
`;

const Solution = () => {
  return (
    <Container>
      <SolutionBox>
        <Partition partitionWidth="50vw">
          <ChartBox>
            <SolutionChart size={400} />
          </ChartBox>
          <SolutionTextBox>
            <SolutionTitle>
              현재 RDS1 은 db.t3.medium 사이즈로 4G 의 메모리중 75% 를
              사용중입니다.
            </SolutionTitle>
          </SolutionTextBox>
        </Partition>
        <Partition partitionWidth="25vw"></Partition>
      </SolutionBox>
    </Container>
  );
};
export default Solution;
