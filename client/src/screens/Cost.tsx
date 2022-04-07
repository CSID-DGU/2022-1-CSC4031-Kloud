import styled from "styled-components";
import { Link, useRouteMatch } from "react-router-dom";
const Container = styled.div`
  height: 100%;
  width: 100%;
`;
const CostHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const Nav = styled.div``;
const NavItem = styled.span`
  color: gainsboro;
  font-size: 1.5rem;
  font-weight: lighter;
`;
const Title = styled.span`
  font-size: 100px;
  color: white;
`;
const Cost = () => {
  return (
    <Container>
      <CostHeader>
        <Title>Cost</Title>
        <Nav>
          <Link to={"/cost/analysis"}>
            <NavItem>Analysis</NavItem>
          </Link>
          <Link to={"/cost/trend"}>
            <NavItem>Trend</NavItem>
          </Link>
          <Link to={"/cost/solution"}>
            <NavItem>Solution</NavItem>
          </Link>
        </Nav>
      </CostHeader>
    </Container>
  );
};
export default Cost;
