import styled from "styled-components";
import { useState } from "react";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { LinearGradient } from "@visx/gradient";
import { pointRadial } from "d3-shape";
import useForceUpdate from "../visualization/useForceUpdate";
import LinkControls from "../visualization/LinkControls";
import getLinkComponent from "../visualization/getLinkComponent";

const Container = styled.div``;
const Tmp = styled.span`
  font-size: 100px;
  color: gainsboro;
`;

const Infra = () => {
  return (
    <Container>
      <Tmp>Infra</Tmp>
    </Container>
  );
};
export default Infra;
