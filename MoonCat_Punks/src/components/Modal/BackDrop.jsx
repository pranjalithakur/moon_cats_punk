import React from "react";
import styled from "styled-components";

const Backdrop = (props) => {
  return <Div onClick={props.backdropClicked}></Div>;
};

export default Backdrop;

const Div = styled.div`
  position: fixed;
  left: 0px;
  top: 0px;
  height: 100%;
  width: 100%;
  z-index: 20;
  background-color: rgba(87, 87, 87, 0.6);
`;
