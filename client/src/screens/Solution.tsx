import styled from "styled-components";
import SolutionChart from "../components/SolutionChart";
import Info from "../components/Info";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const SolutionBox = styled.div`
  width: 80vw;
  height: 82vh;
  border-radius: 10px;
  background-color: gray;
  display: flex;
`;
const Partition = styled.div<{ partitionWidth: string }>`
  width: ${(props) => props.partitionWidth};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ChartBox = styled.div`
  height: 100%;
  width: 37vw;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-right: 70px;
`;

const SolutionTextBox = styled.div`
  width: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const SolutionTitle = styled.p`
  font-size: 25px;
  color: white;
  font-weight: lighter;
`;

const Solution = () => {
  return (
    <Container>
      <Info
        contents={[
          "비용 솔루션 페이지입니다.",
          "인프라 사용량에 근거하여 비용 솔루션을 제시합니다.",
        ]}
      />
      <SolutionBox>
        <Partition partitionWidth="50vw">
          <ChartBox>
            <SolutionChart size={500} />
          </ChartBox>
          <SolutionTextBox>
            <SolutionTitle>현재 RDS1은</SolutionTitle>
            <SolutionTitle>
              db.t3.medium 사이즈로 4G 의 메모리중 75% 를 사용중입니다.
            </SolutionTitle>
          </SolutionTextBox>
        </Partition>
        <Partition partitionWidth="25vw"></Partition>
        <Partition partitionWidth="25vw"></Partition>
      </SolutionBox>
    </Container>
  );
};
export default Solution;
