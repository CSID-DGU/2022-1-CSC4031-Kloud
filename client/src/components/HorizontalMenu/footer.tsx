import React from "react";

export const Footer = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "50px",
        position: "fixed",
        bottom: 0,
        width: "100%"
      }}
    >
      <span>See more advanced example in </span>
      <a
        /* eslint-disable react/jsx-no-target-blank */
        target="_blank"
        rel="noopener"
        style={{ paddingLeft: "5px" }}
        href="https://github.com/asmyshlyaev177/react-horizontal-scrolling-menu"
      >
        Project on GitHub
      </a>
    </div>
  );
};
