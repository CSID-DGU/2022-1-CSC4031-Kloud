import styled from "styled-components";

const InfoBox = styled.div<{ direction?: string }>`
  width: 100%;
  height: auto;
  display: flex;
  align-items: ${(props) => (props.direction ? null : "center")};
  justify-content: center;
  margin: 10px 0 20px 0;
  flex-direction: column;
`;
const Content = styled.span`
  color: white;
  font-weight: lighter;
  font-size: 30px;
  margin-bottom: 10px;
`;

interface IInfo {
  contents: string[];
  direction?: string;
}
const Info = ({ contents, direction }: IInfo) => {
  return (
    <InfoBox direction={direction}>
      {contents.map((content) => (
        <Content>{content}</Content>
      ))}
    </InfoBox>
  );
};

export default Info;
