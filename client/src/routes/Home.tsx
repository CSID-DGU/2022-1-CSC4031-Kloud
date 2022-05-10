import styled from "styled-components";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import { Switch, Route } from "react-router-dom";
import Cost from "./Cost";
import Infra from "../screens/Infra";
import { useRecoilValue } from "recoil";
import { regionAtom } from "../atoms";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  overflow: hidden;
`;
const ContentBox = styled.div`
  padding-left: ${(props) => props.theme.menuWidth};
  width: 100%;
`;

const Home = () => {
  const region = useRecoilValue(regionAtom);
  // const { isLoading: isInfraLoading, data: allInfra } = useQuery<any>(
  //   "allInfra",
  //   getInfra
  // );
  // const { isLoading: isNestedInfraLoading, data: nestedInfra } =
  //   useQuery<INestedInfraResponse>("nestedInfra", getNestedInfra);
  // const {
  //   isLoading: isCostHistoryByResourceLoading,
  //   data: costHistoryByResourceLoading,
  // } = useQuery<any>("costHistoryByResource", getCostHistoryByResource);
  // const { isLoading: isCostHistoryLoading, data: costHistory } = useQuery<any>(
  //   "costHistory",
  //   getCostHistory
  // );

  return (
    <>
      <Header />
      <Container>
        <MenuBar />
        <ContentBox>
          <Switch>
            <Route path={`/`} exact>
              <Infra width={800} height={600} />
            </Route>
            <Route path={`/cost`}>
              <Cost />
            </Route>
          </Switch>
        </ContentBox>
      </Container>
    </>
  );
};

export default Home;
