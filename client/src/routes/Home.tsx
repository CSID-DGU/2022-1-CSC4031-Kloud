import {
  getCostHistory,
  getInfra,
  getNestedInfra,
  getProphetTrend,
  getSimilarityTrend,
} from "../api";
import styled from "styled-components";
import { useQuery } from "react-query";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import Loader from "../components/Loader";
import { Switch, Route } from "react-router-dom";
import Cost from "../screens/Cost";
import Infra from "../screens/Infra";

interface IInfra {
  tmp: null;
}

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
  const { isLoading: isInfraLoading, data: allInfra } = useQuery<any>(
    "allInfra",
    getInfra
  );
  const { isLoading: isNestedInfraLoading, data: nestedInfra } = useQuery<any>(
    "nestedInfra",
    getNestedInfra
  );
  const { isLoading: isCostHistoryLoading, data: costHistory } = useQuery<any>(
    "costHistory",
    getCostHistory
  );
  const { isLoading: isSimilarityLoading, data: similarityTrend } =
    useQuery<any>("similarity", getSimilarityTrend);

  const { isLoading: isProphetLoading, data: prophetTrend } = useQuery<any>(
    "prophet",
    getProphetTrend
  );
  return (
    <>
      <Header />
      <Container>
        <MenuBar />
        {isInfraLoading || isNestedInfraLoading || isCostHistoryLoading ? (
          <Loader />
        ) : (
          <>
            <ContentBox>
              <Switch>
                <Route path={`/`} exact>
                  <Infra />
                </Route>
                <Route path={`/cost`}>
                  <Cost />
                </Route>
              </Switch>
            </ContentBox>
          </>
        )}
      </Container>
    </>
  );
};

export default Home;
