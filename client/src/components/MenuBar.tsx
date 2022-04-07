import styled from "styled-components";
import { Link, useRouteMatch } from "react-router-dom";

const Container = styled.div`
  box-sizing: border-box;
  background-color: #a1a1a2;
  width: 215px;
  height: ${(props) => props.theme.menuHeight};
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-top: 5rem;
`;

const Menu = styled.p<{ isActive: boolean }>`
  color: ${(props) => (props.isActive ? "yellow" : props.theme.bgColor)};
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1rem;
  :hover {
    color: yellow;
  }
  -webkit-transition: color 1s ease-in-out;
  transition: color 1s ease-in-out;
`;

const MenuBar = () => {
  const infraMatch = useRouteMatch("/");
  const costMatch = useRouteMatch("/cost");

  return (
    <Container>
      <Link to={`/`}>
        <Menu isActive={infraMatch?.isExact ? true : false}>
          Infrastructure
        </Menu>
      </Link>
      <Link to={`/cost`}>
        <Menu isActive={costMatch?.isExact ? true : false}>
          Cost Management
        </Menu>
      </Link>
    </Container>
  );
};

export default MenuBar;
