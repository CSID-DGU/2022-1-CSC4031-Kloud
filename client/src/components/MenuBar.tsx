import styled from "styled-components";
import { Link } from "react-router-dom";
import { logOut } from "../api";
import { useSetRecoilState } from "recoil";
import { isLoggedInAtom } from "../atoms";

const Container = styled.div``;
const MenuBar = () => {
  return <Container></Container>;
};

export default MenuBar;
