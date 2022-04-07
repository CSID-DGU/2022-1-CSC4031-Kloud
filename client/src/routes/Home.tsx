import { getInfra } from "../api";
import styled from "styled-components";
import { useQuery } from "react-query";
import Header from "../components/Header";
import MenuBar from "../components/MenuBar";
import { Switch, Route } from "react-router-dom";
import Cost from "../screens/Cost";
import Infra from "../screens/Infra";

interface IInfra {
  tmp: null;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;
const Content = styled.div`
  width: 85vw;
`;

const Home = () => {
  const { isLoading, data } = useQuery<any>("allInfra", getInfra);
  console.log(data);
  return (
    <>
      <Header />
      <Container>
        <MenuBar />
        <Switch>
          <Route path={`/`} exact>
            <Infra />
          </Route>
          <Route path={`/cost`}>
            <Cost />
          </Route>
        </Switch>
      </Container>
    </>
  );
};

export default Home;
