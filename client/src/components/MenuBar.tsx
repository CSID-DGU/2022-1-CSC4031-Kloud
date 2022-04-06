import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div`
  box-sizing: border-box;
  background-color: #a1a1a2;
  width: 215px;
  height: ${(props) => props.theme.menuHeight};
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-top: 4rem;
`;

const Menu = styled.p`
  color: ${(props) => props.theme.bgColor};
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1rem;
`;

const MenuBar = () => {
  return (
    <Container>
      <Link to={`/`}>
        <Menu>Infrastructure</Menu>
      </Link>
      <Link to={`/cost`}>
        <Menu>Cost Management</Menu>
      </Link>
    </Container>
  );
};

export default MenuBar;
