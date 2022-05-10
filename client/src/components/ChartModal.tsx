import styled from "styled-components";
import Chart, { ICostHistory } from "./Chart";

interface IChartModal {
  resourceId: string;
  instanceType?: string;
  costHistory: ICostHistory;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const Title = styled.span`
  font-size: 40px;
  color: wheat;
  font-weight: lighter;
  margin: 15px 0px;
`;
const ResourceInfo = styled.span`
  font-size: 20px;
  color: white;
  font-weight: lighter;
`;

const ResourceInfoBox = styled.div`
  justify-content: space-between;
  display: flex;
  margin-bottom: 35px;
`;

const ChartModal = ({ resourceId, costHistory, instanceType }: IChartModal) => {
  return (
    <>
      <Container>
        <Title>Cost Chart</Title>
        <ResourceInfoBox>
          {instanceType ? <ResourceInfo>{instanceType}</ResourceInfo> : null}
          <ResourceInfo>{resourceId}</ResourceInfo>
        </ResourceInfoBox>
        <Chart
          size={"180%"}
          resourceId={resourceId}
          costHistory={costHistory}
        />
      </Container>
    </>
  );
};

export default ChartModal;
