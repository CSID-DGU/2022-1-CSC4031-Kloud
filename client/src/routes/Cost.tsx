import styled from "styled-components";
import { Link, useRouteMatch, Switch, Route } from "react-router-dom";
import Solution from "../screens/Solution";
import Analysis from "../screens/Analysis";
import Trend from "../screens/Trend";

const Container = styled.div`
  height: 100%;
  width: 100%;
`;
const CostHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const Nav = styled.div`
  padding-top: 1.2rem;
`;
const NavItem = styled.span<{ isActive: boolean }>`
  color: gainsboro;
  font-size: 1.5rem;
  font-weight: lighter;
  margin-right: 1rem;
  text-decoration: ${(props) =>
    props.isActive ? "underline yellow" : "underline"};
  :hover {
    text-decoration: underline yellow;
  }
  transition: text-decoration 0.5s ease-in-out;
  -webkit-transition: text-decoration 0.5s ease-in-out;
`;
const Title = styled.span`
  font-size: 100px;
  color: white;
`;
const Cost = () => {
  const analysisMatch = useRouteMatch("/cost/analysis");
  const trendMatch = useRouteMatch("/cost/trend");
  const solutionMatch = useRouteMatch("/cost/solution");

  return (
    <Container>
      <CostHeader>
        {trendMatch ? <Title></Title> : <Title>Cost</Title>}
        <Nav>
          <Link to={"/cost/analysis"}>
            <NavItem isActive={analysisMatch ? true : false}>Analysis</NavItem>
          </Link>
          <Link to={"/cost/trend"}>
            <NavItem isActive={trendMatch ? true : false}>Trend</NavItem>
          </Link>
          <Link to={"/cost/solution"}>
            <NavItem isActive={solutionMatch ? true : false}>Solution</NavItem>
          </Link>
        </Nav>
      </CostHeader>
      <Switch>
        <Route path={"/cost/analysis"}>
          <Analysis />
        </Route>
        <Route path={"/cost/trend"}>
          <Trend />
        </Route>
        <Route path={"/cost/solution"}>
          <Solution />
        </Route>
      </Switch>
    </Container>
  );
};
export default Cost;
