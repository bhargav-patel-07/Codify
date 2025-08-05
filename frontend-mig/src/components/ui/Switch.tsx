import React from 'react';
import styled from 'styled-components';

const Switch = () => {
  return (
    <StyledWrapper>
      <label htmlFor="filter" className="switch" aria-label="Toggle Filter">
        <input type="checkbox" id="filter" />
        <span>LandingPage</span>
        <span>Code Editor</span>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .switch {
    --_switch-bg-clr: transparent;
    --_switch-padding: 2px;
    --_slider-bg-clr:rgb(217, 251, 252);
    --_slider-bg-clr-on:rgb(180, 226, 245);
    --_slider-txt-clr:rgb(0, 0, 0);
    --_label-padding: 0.75rem 1.5rem;
    --_switch-easing: cubic-bezier(0.47, 1.64, 0.41, 0.8);
    color: #000000;
    border: 1px solid #000000;
    width: fit-content;
    display: flex;
    justify-content: center;
    position: relative;
    border-radius: 9999px;
    cursor: pointer;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    position: relative;
    isolation: isolate;
    @media (max-width: 640px) {
      --_label-padding: 1rem 1.5rem;
      font-size: 1rem;
    }
  }

  .switch input[type="checkbox"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .switch > span {
    display: grid;
    place-content: center;
    transition: opacity 300ms ease-in-out 150ms;
    padding: var(--_label-padding);
  }
  .switch::before,
  .switch::after {
    content: "";
    position: absolute;
    border-radius: inherit;
    transition: inset 150ms ease-in-out;
  }
  /* switch slider */
  .switch::before {
    background-color: var(--_slider-bg-clr);
    inset: var(--_switch-padding) 50% var(--_switch-padding)
      var(--_switch-padding);
    transition:
      inset 500ms var(--_switch-easing),
      background-color 500ms ease-in-out;
    z-index: -1;
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.3),
      0 1px rgba(255, 255, 255, 0.3);
  }
  /* switch bg color */
  .switch::after {
    background-color: var(--_switch-bg-clr);
    inset: 0;
    z-index: -2;
    border-radius: inherit;
  }
  /* switch hover & focus */
  .switch:focus-within::after {
    inset: -0.1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .switch:has(input:checked):hover > span:first-of-type,
  .switch:has(input:not(:checked)):hover > span:last-of-type {
    opacity: 1;
    transition-delay: 0ms;
    transition-duration: 100ms;
  }
  /* switch hover */
  .switch:has(input:checked):hover::before {
    inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding)
      45%;
  }
  .switch:has(input:not(:checked)):hover::before {
    inset: var(--_switch-padding) 45% var(--_switch-padding)
      var(--_switch-padding);
  }
  /* checked - move slider to right */
  .switch:has(input:checked)::before {
    background-color: var(--_slider-bg-clr-on);
    inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding)
      50%;
  }
  /* checked - set opacity */
  .switch > span:last-of-type,
  .switch > input:checked + span:first-of-type {
    opacity: 0.75;
  }
  .switch > input:checked ~ span:last-of-type {
    opacity: 1;
  }`;

export default Switch;
