import styled from "styled-components";
import { Link } from "react-router-dom";
import { logOut } from "../api";
import { useSetRecoilState } from "recoil";
import { isLoggedInAtom } from "../atoms";

const HeaderContainer = styled.header`
  height: ${(props) => props.theme.navHeight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.5px solid ${(props) => props.theme.accentColor};
  background-color: gainsboro;
  padding: 1rem;
  width: 100%;
`;
const Logo = styled.span`
  font-size: 24px;
  color: ${(props) => props.theme.bgColor};
  font-weight: bolder;
`;
const Nav = styled.nav``;
const LogOut = styled.button`
  font-size: 17px;
  color: ${(props) => props.theme.bgColor};
  background-color: transparent;
  border-radius: 8px;
  padding: 0.3rem 0.5rem;
  :hover {
    background-color: ${(props) => props.theme.bgColor};
    color: white;
  }
  -webkit-transition: background-color 1s ease-in-out;
  transition: background-color 1s ease-in-out;
`;
const Header = () => {
  const setIsLoggedIn = useSetRecoilState(isLoggedInAtom);
  const logOutOnClick = async () => {
    await logOut();
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
  };
  return (
    <HeaderContainer>
      <Link to="/">
        <Logo>KLOUD</Logo>
      </Link>
      <Nav>
        <LogOut onClick={logOutOnClick}>LOGOUT</LogOut>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
