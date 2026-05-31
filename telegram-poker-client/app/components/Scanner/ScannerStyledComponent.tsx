import * as styledImport from "styled-components";

const styled = (styledImport.default || styledImport) as any;
const s = styled;

// Стили для HUD (Heads-Up Display)
export const ScannerContainer = s.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
`;

export const Video = s.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
`;

export const ScanOverlay = s.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  container-type: inline-size;
  pointer-events: none;
`;

export const ScanTarget = s.div`

  @media (max-width: 768px) {
    width: 50%;
    height: 50%;
  }

  @media (min-width: 769px) {
    width: 200px;
    height: 300px;
  }

    @container (max-width: 300px) {
    width: 50%;
    height: 50%;
  }

  @container (min-width: 300px) {
    width: 200px;
    height: 300px;
  }

  border: 2px solid #00ff00;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  position: relative;

  &::before {
    content: "SCAN CARD";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    color: #00ff00;
    font-family: monospace;
    font-weight: bold;
  }
`;

export const CardValue = s.div`
  background: "rgba(0,0,0,0.7)",
  color: "#fff",
  padding: "10px",
  marginTop: "20px",
  borderRadius: "8px",
`;

export const ControlsContainer = s.div`
  position: absolute;
  top: 0%;
  right: 0%;
  transform: translateX(-50%);
  padding: 16px;
  pointer-events: auto; /* ПОВЕРТАЄМО КЛІКИ */
  z-index: 10;
`;
