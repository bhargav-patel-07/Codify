import React from 'react';
import styled from 'styled-components';

const Switch = () => {
  return (
    <StyledWrapper>
      <label className="toggle-container">
        <input type="checkbox" />
        <div className="toggle-button" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .toggle-container {
    perspective: 1000px;
  }

  .toggle-container input {
    display: none; /* Hide default checkbox */
  }

  .toggle-button {
    position: relative;
    width: 100px;
    height: 50px;
    background: linear-gradient(145deg, #e6e6e6, #ffffff);
    border-radius: 25px;
    box-shadow: 
                  /* Neumorphic outer shadows */
      8px 8px 16px rgba(0, 0, 0, 0.1),
      -8px -8px 16px rgba(255, 255, 255, 0.7),
      /* Skeuomorphic inset for depth */ inset 0 2px 4px rgba(255, 255, 255, 0.8),
      inset 0 -2px 4px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Elastic bounce */
  }

  .toggle-button::before {
    content: "";
    position: absolute;
    width: 46px;
    height: 46px;
    background: linear-gradient(145deg, #ff6b6b, #ff3b3b);
    border-radius: 50%;
    top: 2px;
    left: 2px;
    box-shadow: 
                  /* Neumorphic knob shadow */
      4px 4px 8px rgba(0, 0, 0, 0.2),
      -4px -4px 8px rgba(255, 255, 255, 0.9),
      /* Skeuomorphic depth */ inset 0 -1px 2px rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform: translateZ(12px); /* 3D pop-out effect */
  }

  .toggle-button::after {
    content: "";
    position: absolute;
    width: 92px;
    height: 42px;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.2),
      rgba(0, 0, 0, 0.1)
    );
    border-radius: 21px;
    top: 4px;
    left: 4px;
    transition: all 0.4s ease-in-out;
    pointer-events: none; /* Prevent interaction with pseudo-element */
  }

  .toggle-container input:checked ~ .toggle-button {
    background: linear-gradient(145deg, #c3e6cb, #d4f4dd);
    box-shadow:
      8px 8px 16px rgba(0, 0, 0, 0.1),
      -8px -8px 16px rgba(255, 255, 255, 0.7),
      inset 0 2px 4px rgba(255, 255, 255, 0.8),
      inset 0 -2px 4px rgba(0, 0, 0, 0.15);
  }

  .toggle-container input:checked ~ .toggle-button::before {
    left: 52px;
    background: linear-gradient(145deg, #2ecc71, #27ae60);
    transform: translateZ(12px) rotate(360deg); /* Spin animation */
  }

  .toggle-container input:checked ~ .toggle-button::after {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.3),
      rgba(0, 0, 0, 0.05)
    );
  }

  .toggle-button:active::before {
    transform: translateZ(8px); /* Pressed effect */
    box-shadow:
      2px 2px 4px rgba(0, 0, 0, 0.2),
      -2px -2px 4px rgba(255, 255, 255, 0.9);
  }

  /* Hover effect for extra interactivity */
  .toggle-button:hover {
    box-shadow:
      10px 10px 20px rgba(0, 0, 0, 0.15),
      -10px -10px 20px rgba(255, 255, 255, 0.8);
  }

  /* Subtle animation for toggle track */
  @keyframes track-glow {
    0% {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
    }
    100% {
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    }
  }

  .toggle-container input:checked ~ .toggle-button::after {
    animation: track-glow 1.5s infinite;
  }`;

export default Switch;
