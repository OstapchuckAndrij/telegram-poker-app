import { useState } from "react";
//components
import Scanner from "../Scanner/Scanner";
import * as styledImport from "styled-components";
import ScannerSettingsModal from "../modals/Scanner/ScannerSettingsModal";

//types
import { CameraType, DealerMode, LayoutType } from "../../types/dealerTypes";
import SettingsComponent from "../Scanner/SettingsComponent";

const styled = (styledImport.default || styledImport) as any;
const s = styled;

const DashboardContainer = s.div`
  display: grid;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 2fr 1fr;
  }
  
  @media (min-width: 769px) {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr; 
  }

  height: 100vh;
  background: #1a1a1a;
  gap: 4px;

  &.pip-mode {
    position: relative;
    display: block; // Для Picture-in-Picture
  }
`;

const ViewSlot = s.div<{ $isMain: boolean; $isPip: boolean }>`
  position: ${(props: any) => (props.$isPip ? "absolute" : "relative")};
  bottom: ${(props: any) => (props.$isPip ? "20px" : "0")};
  right: ${(props: any) => (props.$isPip ? "20px" : "0")};
  @media (min-width: 769px) {
    width: ${(props: any) => (props.$isPip ? "240px" : "100%")};
    height: ${(props: any) => (props.$isPip ? "400px" : "100%")};
  }
  width: ${(props: any) => (props.$isPip ? "120px" : "100%")};
  height: ${(props: any) => (props.$isPip ? "200px" : "100%")};
  z-index: ${(props: any) => (props.$isPip ? "100" : "1")};
  border: ${(props: any) => (props.$isPip ? "2px solid #ffffff33" : "none")};
  border-radius: ${(props: any) => (props.$isPip ? "12px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
`;

interface DualCameraDashBoardProps {
  dealerMode: DealerMode;
  // Тут можна додати пропси для передачі потоків або налаштувань
  streamDesk?: MediaStream;
  streamFace?: MediaStream;
}

const DualCameraDashBoard = ({
  dealerMode,
  streamDesk,
  streamFace,
}: DualCameraDashBoardProps) => {
  const [layoutMode, setLayoutMode] = useState<LayoutType>(LayoutType.pip);
  const [isDeskMain, setIsDeskMain] = useState(true);

  const [showSettings, setShowSettings] = useState(false);

  const swapViews = () => setIsDeskMain(!isDeskMain);

  return (
    <>
      <DashboardContainer
        className={layoutMode === LayoutType.pip ? "pip-mode" : ""}
      >
        {/* Слот для Desk View (Сканер) */}
        <ViewSlot
          $isMain={!isDeskMain}
          $isPip={isDeskMain && layoutMode === LayoutType.pip}
          onClick={() => isDeskMain && swapViews()}
        >
          <Scanner
            externalStream={streamFace}
            isScannerEnabled={false}
            isMirrored={true}
            cameraType={CameraType.user}
            dealerMode={dealerMode}
          />
        </ViewSlot>

        {/* Слот для Face View (Обличчя дилера) */}
        <ViewSlot
          $isMain={isDeskMain}
          $isPip={!isDeskMain && layoutMode === LayoutType.pip}
          onClick={() => !isDeskMain && swapViews()}
        >
          <Scanner
            externalStream={streamDesk}
            isScannerEnabled={true}
            cameraType={CameraType.table}
            dealerMode={dealerMode}
          />
        </ViewSlot>

        {/* Панель керування */}
        <SettingsComponent
          layoutType={layoutMode}
          onSettingsClick={() => setShowSettings(true)}
          onToggleLayout={() =>
            setLayoutMode(
              layoutMode === LayoutType.pip ? LayoutType.split : LayoutType.pip,
            )
          }
        />
      </DashboardContainer>
      {showSettings && (
        <ScannerSettingsModal
          onClose={() => setShowSettings(false)}
          onChangeDevice={changeCamera}
          cameraType={cameraType}
          dealerMode={dealerMode}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
        />
      )}
    </>
  );
};

export default DualCameraDashBoard;
