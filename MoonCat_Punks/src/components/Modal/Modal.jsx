import React from "react";
import styled from "styled-components";

const Modal = (props) => {
  return (
    <Container style={{ ...props.customContainerStyle }}>
      <Content>
        <Title>
          <div className="heading">{props.title}</div>
          <div className="cross" onClick={props.collapse}>
            {"X"}
          </div>
        </Title>
        <Text>{props.children}</Text>
        <Options>
          <Div
            className="delete"
            onClick={() => props.optionClicked(props.option1)}
          >
            {props.option1}
          </Div>
          <Div
            className="cancel"
            onClick={() => props.optionClicked(props.option2)}
          >
            {props.option2}
          </Div>
        </Options>
      </Content>
    </Container>
  );
};

export default Modal;

const Container = styled.div`
  position: absolute;
  width: 420px;
  height: 200px;
  top: 0%;
  bottom: 0%;
  left: 0%;
  right: 0%;
  z-index: 30;
  margin: auto auto;
  /* background-color: white; */
  background-color: #051739;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-family: VT323;

  @media (max-width: 479px) {
    width: 100%;
  }
`;

const Content = styled.div`
  width: 380px;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 20px 20px 20px 20px;

  @media (max-width: 479px) {
    width: 100%;
  }
`;

const Text = styled.div`
  text-align: left;
  width: 100%;
  font-size: 16px;
`;

const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: auto;

  .delete {
    background-color: #ff5b5b;
    margin-right: 10px;
    :hover {
      background-color: #ff5b5b;
    }
  }

  .cancel {
    background-color: #ff5b5b;

    :hover {
      /* background-color: rgba(0, 0, 0, 0.1); */
    }
  }

  @media (max-width: 479px) {
    width: 70%;
  }
`;

const Div = styled.div`
  font-size: 1.2rem;
  padding: 5px 10px;
  cursor: pointer;
  width: 75px;
`;

const Title = styled.div`
  width: 100%;
  margin-bottom: 20px;
  font-size: 16px;

  .heading {
    float: left;
    color: white;
    font-size: 1.5rem;
  }
  .cross {
    float: right;
    cursor: pointer;
    color: white;
  }
`;
