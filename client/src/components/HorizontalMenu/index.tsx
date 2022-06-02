import React from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import styled from "styled-components";

import { LeftArrow, RightArrow } from "./arrows";
import { Card } from "./card";
import "./globalStyles.css";
import "./hideScrollbar.css";

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

const Container = styled.div`
  width: 95%;
  margin-top: 100px;
`;

interface IHorizontalMenu {
  contents: JSX.Element[];
}

function HorizontalMenu({ contents }: IHorizontalMenu) {
  return (
    <Container>
      <ScrollMenu
        LeftArrow={LeftArrow}
        RightArrow={RightArrow}
        onWheel={onWheel}
      >
        {contents.map((content, idx) => (
          <Card
            itemId={idx} // NOTE: itemId is required for track items
            key={idx}
            content={content}
          />
        ))}
      </ScrollMenu>
    </Container>
  );
}
export default HorizontalMenu;

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;

  if (isThouchpad) {
    ev.stopPropagation();
    return;
  }

  if (ev.deltaY < 0) {
    apiObj.scrollNext();
  } else if (ev.deltaY > 0) {
    apiObj.scrollPrev();
  }
}
