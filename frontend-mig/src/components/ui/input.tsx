import React from 'react';
import styled from 'styled-components';

const Input = () => {
  return (
    <StyledWrapper>
      <div className="messageBox">
        <div className="fileUploadWrapper">
          <label htmlFor="file">
            <svg viewBox="0 0 337 337" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="168.5" cy="168.5" r="158.5" fill="none" stroke="#6c6c6c" strokeWidth={20} />
              <path d="M167.759 79V259" stroke="#6c6c6c" strokeWidth={25} strokeLinecap="round" />
              <path d="M79 167.138H259" stroke="#6c6c6c" strokeWidth={25} strokeLinecap="round" />
            </svg>
            <span className="tooltip">Add an image</span>
          </label>
          <input name="file" id="file" type="file" />
        </div>
        <input id="messageInput" type="text" placeholder="Message..." required />
        <button id="sendButton">
          <svg viewBox="0 0 664 663" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888" fill="none" />
            <path d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888" stroke="#6c6c6c" strokeWidth="33.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .messageBox {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 56px;
    display: flex;
    align-items: center;
    background: none;
    padding: 0 16px;
    border: 1px solid black;
    border-radius: 12px;
  }
  .messageBox:focus-within {
    border: none;
  }
  .fileUploadWrapper {
    width: fit-content;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, Helvetica, sans-serif;
  }

  #file {
    display: none;
  }
  .fileUploadWrapper label {
    cursor: pointer;
    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .fileUploadWrapper label svg {
    height: 20px;
    width: 20px;
  }
  .fileUploadWrapper label svg path {
    transition: all 0.3s;
  }
  .fileUploadWrapper label svg circle {
    transition: all 0.3s;
  }
  .fileUploadWrapper label:hover svg path {
    stroke: #fff;
  }
  .fileUploadWrapper label:hover svg circle {
    stroke: #fff;
    fill:rgb(0, 0, 0);
  }
  .fileUploadWrapper label:hover .tooltip {
    display: block;
    opacity: 1;
  }
  .tooltip {
    position: absolute;
    top: -40px;
    display: none;
    opacity: 0;
    color: white;
    font-size: 10px;
    text-wrap: nowrap;
    background-color: #000;
    padding: 6px 10px;
    border: 1px solid #3c3c3c;
    border-radius: 5px;
    transition: all 0.3s;
  }
  #messageInput {
    width: 100%;
    min-width: 0;
    height: 100%;
    background: none;
    outline: none;
    border: none;
    padding: 0 12px;
    color:rgb(0, 0, 0);
    font-size: 16px;
  }
  #messageInput:focus ~ #sendButton svg path,
  #messageInput:valid ~ #sendButton svg path {
    fill:rgb(252, 248, 248);
    stroke: black;
  }

  #sendButton {
    width: fit-content;
    height: 100%;
    background-color: transparent;
    outline: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
  }
  #sendButton svg {
    height: 24px;
    width: 24px;
    transition: all 0.3s;
  }
  #sendButton svg path {
    transition: all 0.3s;
  }
  #sendButton:hover svg path {
    fill: #3682f4;
    stroke: black;
  }

  @media (max-width: 640px) {
    .messageBox {
      height: 48px;
      padding: 0 12px;
      border-radius: 8px;
    }
  }

  @media (min-width: 640px) {
    #messageInput {
      font-size: 18px;
      padding: 0 16px;
    }
    .fileUploadWrapper label svg {
      height: 24px;
      width: 24px;
    }
  }
`;

export default Input;
