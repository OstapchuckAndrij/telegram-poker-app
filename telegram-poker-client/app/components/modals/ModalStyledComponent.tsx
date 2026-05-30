// Допоміжний хак для styled, який ми вже використовували
import styled from "styled-components";

export enum buttonColors {
  green = "#00ff00",
  red = "#ff0000",
  gray = "#333",
}

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  h2 {
    font-family: sans-serif;
    letter-spacing: 1px;
  }

  h3 {
    margin: 0 0 10px 0;
    color: #00ff00;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    color: #aaa;
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

export const ModalContainer = styled.div`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 15px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ModalContent = styled.div`
  padding: 15px;
  width: 100%;
  text-align: center;
`;

export const OptionCardList = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding: 15px;
  pointer-events: auto;
  border: 2px solid
    ${(props: any) => (props.$isSelected ? "#ffffff" : "#6d6d6d")};
  background: ${(props: any) => (props.$isSelected ? "#333" : "transparent")};
  border-radius: 15px;
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 2px solid #ffffff;
    background: #333;
  }
`;

export const OptionCard = styled.div`
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  pointer-events: auto;
  text-align: left;

  &:hover {
    border-color: #00ff00;
    background: #333;
    transform: translateY(-2px);
  }
`;

export const ModalButton = styled.button<{ $dynamicStyles: any }>`
  border-radius: 15px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
  ${(props: any) => props.$dynamicStyles}
`;

export const ControlsButton = (color: buttonColors = buttonColors.green) => ({
  padding: "4px",
  "&:hover": { background: "#333", color: color },
});

export const OptionButton = (color: buttonColors = buttonColors.green) => ({
  border: "2px solid #333",
  padding: "8px",
  "&:hover": {
    border: `2px solid ${color}`,
    background: "#333",
    color: color,
  },
});

export const Text = styled.div`
  font-family: monospace;
  border: 2px solid #333;
  text-align: center;
  margin: 10px 0;
  padding: 10px;
`;
