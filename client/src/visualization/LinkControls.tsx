import React from "react";

const controlStyles = { fontSize: 10 };

type Props = {
  layout: string;
  orientation: string;
  linkType: string;
  setLayout: (layout: string) => void;
  setOrientation: (orientation: string) => void;
  setLinkType: (linkType: string) => void;
};

export default function LinkControls({
  layout,
  orientation,
  linkType,
  setLayout,
  setOrientation,
  setLinkType,
}: Props) {
  return (
    <div style={controlStyles}>
      <label>layout:</label>&nbsp;
      <select
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setLayout(e.target.value)}
        value={layout}
      >
        <option value="cartesian">cartesian</option>
        <option value="polar">polar</option>
      </select>
      &nbsp;&nbsp;
      <label>orientation:</label>&nbsp;
      <select
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setOrientation(e.target.value)}
        value={orientation}
        disabled={layout === "polar"}
      >
        <option value="vertical">vertical</option>
        <option value="horizontal">horizontal</option>
      </select>
      &nbsp;&nbsp; )
    </div>
  );
}
