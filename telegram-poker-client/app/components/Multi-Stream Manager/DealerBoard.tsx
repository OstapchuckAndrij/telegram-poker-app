import { useState } from "react";
import { Scanner } from "../Scanner";

import * as styledImport from "styled-components";

const styled = (styledImport.default || styledImport) as any;
const s = styled;

const DashboardContainer = s.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr; // Початковий макет 50/50
  height: 100vh;
  background: #1a1a1a;
  gap: 4px;

  &.pip-mode {
    position: relative;
    display: block; // Для Picture-in-Picture
  }
`;

const ViewSlot = s.div<{ $isMain: boolean; $isPip: boolean }>`
  position: ${(props) => (props.$isPip ? "absolute" : "relative")};
  bottom: ${(props) => (props.$isPip ? "20px" : "0")};
  right: ${(props) => (props.$isPip ? "20px" : "0")};
  width: ${(props) => (props.$isPip ? "150px" : "100%")};
  height: ${(props) => (props.$isPip ? "220px" : "100%")};
  z-index: ${(props) => (props.$isPip ? "100" : "1")};
  border: ${(props) => (props.$isPip ? "2px solid #ffffff33" : "none")};
  border-radius: ${(props) => (props.$isPip ? "12px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
`;

const DealerBoard = () => {
  const [streamDesk, setStreamDesk] = useState<MediaStream | null>(null);
  const [streamFace, setStreamFace] = useState<MediaStream | null>(null);

  const [isDeskMain, setIsDeskMain] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"split" | "pip">("pip");

  //   // Функція запуску двох камер
  //   const initStream = async (deviceId: string, type: "face" | "desk") => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: { deviceId: { exact: deviceId } },
  //       });
  //       if (type === "face") setStreamFace(stream);
  //       else setStreamDesk(stream);
  //     } catch (err) {
  //       console.error(`Error loading ${type} stream:`, err);
  //     }
  //   };

  const swapViews = () => setIsDeskMain(!isDeskMain);

  return (
    <DashboardContainer className={layoutMode === "pip" ? "pip-mode" : ""}>
      {/* Слот для Desk View (Сканер) */}
      <ViewSlot
        $isMain={isDeskMain}
        $isPip={!isDeskMain && layoutMode === "pip"}
        onClick={() => !isDeskMain && swapViews()}
      >
        <Scanner
          //externalStream={streamDesk}
          isScannerEnabled={isDeskMain} // Скануємо лише коли ця камера головна
          cameraLabel="TABLE VIEW"
        />
      </ViewSlot>

      {/* Слот для Face View (Обличчя дилера) */}
      <ViewSlot
        $isMain={!isDeskMain}
        $isPip={isDeskMain && layoutMode === "pip"}
        onClick={() => isDeskMain && swapViews()}
      >
        <Scanner
          //externalStream={streamFace}
          isScannerEnabled={!isDeskMain}
          cameraLabel="DEALER"
          isMirrored={true} // Обличчя зазвичай дзеркальне
        />
      </ViewSlot>

      {/* Панель керування */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 200 }}>
        <button
          onClick={() => setLayoutMode(layoutMode === "pip" ? "split" : "pip")}
        >
          Toggle Layout Mode
        </button>
      </div>
    </DashboardContainer>
  );
};

export default DealerBoard;
