import styled from "styled-components";

const Container = styled.div`
  box-sizing: border-box;
  background-color: #a1a1a2;
  width: 15vw;
  height: ${(props) => props.theme.menuHeight};
`;

const MenuBar = () => {
  return <Container>asdf</Container>;
};

export default MenuBar;
