import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -33px;
  margin-left: -33px;
  color: white;
  font-size: 30px;
  font-weight: lighter;
`;
const Circle = styled.span<{
  duration: string;
  width?: string;
  transformOrigin?: string;
}>`
  position: absolute;
  display: block;
  border: 3px solid yellow;
  border-radius: 100%;
  animation-name: rotate;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-duration: ${(props) => props.duration};
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  transform-origin: ${(props) =>
    props.transformOrigin
      ? `${props.transformOrigin} ${props.transformOrigin}`
      : null};
  @keyframes rotate {
    0% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }
`;
const Loader = () => {
  return (
    <Container>
      <Circle duration={"1500ms"} width={"60px"}>
        <Circle duration={"4500ms"} transformOrigin={"63%"} width={"40px"}>
          <Circle
            duration={"9200ms"}
            transformOrigin={"74%"}
            width={"21px"}
          ></Circle>
        </Circle>
      </Circle>
    </Container>
  );
};

export default Loader;
