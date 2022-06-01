import React from "react";
import ReactDOM from "react-dom";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";

import { LeftArrow, RightArrow } from "./arrows";
import { Card } from "./card";
import { Footer } from "./footer";
import { Header } from "./header";
import "./globalStyles.css";

// NOTE: embrace power of CSS flexbox!
// import "./arrowsOnBottomOrTop.css";
import "./hideScrollbar.css";
// import "./firstItemMargin.css";

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

const elemPrefix = "test";
const getId = (index: number) => `${elemPrefix}${index}`;

const getItems = () =>
  Array(20)
    .fill(0)
    .map((_, ind) => ({ id: getId(ind) }));

function HorizontalMenu() {
  const [items] = React.useState(getItems);

  return (
    <>
      <Header />
      <div className="example" style={{ paddingTop: "100px" }}>
        <div>
          <ScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={RightArrow}
            onWheel={onWheel}
          >
            {items.map(({ id }) => (
              <Card
                title={id}
                itemId={id} // NOTE: itemId is required for track items
                key={id}
              />
            ))}
          </ScrollMenu>
        </div>
        <Footer />
      </div>
    </>
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
