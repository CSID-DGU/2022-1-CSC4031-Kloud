import styled from "styled-components";

const InfoBox = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
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
}
const Info = ({ contents }: IInfo) => {
  return (
    <InfoBox>
      {contents.map((content) => (
        <Content>{content}</Content>
      ))}
    </InfoBox>
  );
};

export default Info;
