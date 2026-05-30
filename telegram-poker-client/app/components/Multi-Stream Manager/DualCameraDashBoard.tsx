import { useState } from "react";
//components
import Scanner from "../Scanner/Scanner";
import styled from "styled-components";
import ScannerSettingsModal from "../modals/Scanner/ScannerSettingsModal";

//types
import { CameraType, DealerMode, LayoutType } from "../../types/shared.types";
import SettingsComponent from "../Scanner/SettingsComponent";

//hooks
import { useCameraStream } from "~/hooks/useСameraStream";

const DashboardContainer = styled.div`
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

const ViewSlot = styled.div<{ $isMain: boolean; $isPip: boolean }>`
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
  externalStream?: MediaStream | null;
}

const DualCameraDashBoard = ({
  dealerMode,
  externalStream,
}: DualCameraDashBoardProps) => {
  const cameraManager = useCameraStream({
    peerIdFromUrl: undefined,
    streamMode: dealerMode,
  });

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
            stream={cameraManager.streamFace!}
            isScannerEnabled={false}
            isMirrored={true}
          />
        </ViewSlot>

        {/* Слот для Face View (Обличчя дилера) */}
        <ViewSlot
          $isMain={isDeskMain}
          $isPip={!isDeskMain && layoutMode === LayoutType.pip}
          onClick={() => !isDeskMain && swapViews()}
        >
          <Scanner
            stream={externalStream || cameraManager.streamDesk!}
            isScannerEnabled={true}
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
          onChangeDevice={cameraManager.changeCamera}
          cameraType={isDeskMain ? CameraType.table : CameraType.user}
          dealerMode={dealerMode}
          devices={cameraManager.devices}
          selectedDeviceId={
            isDeskMain
              ? cameraManager.selectedDeskId
              : cameraManager.selectedFaceId
          }
        />
      )}
    </>
  );
};

export default DualCameraDashBoard;
