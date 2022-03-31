import styled from "styled-components";
import { Link } from "react-router-dom";
const HeaderContainer = styled.header`
  height: 7vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.5px solid ${(props) => props.theme.accentColor};
  padding: 1rem;
`;
const Logo = styled.a`
  font-size: 20px;
  color: ${(props) => props.theme.textColor};
`;
const Nav = styled.nav``;
const LogOut = styled.button`
  font-size: 17px;
  color: ${(props) => props.theme.textColor};
  background-color: transparent;
`;
const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <Link to="/">KLOUD</Link>
      </Logo>
      <Nav>
        <LogOut>LOGOUT</LogOut>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
