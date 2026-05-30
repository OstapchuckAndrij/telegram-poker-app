import { lazy, Suspense, useState } from "react";
import { useSearchParams } from "react-router";
//components
import SettingsComponent from "../components/Scanner/SettingsComponent";
//modals
import ScannerSettingsModal from "../components/modals/Scanner/ScannerSettingsModal";
//hooks
import { useCameraStream } from "../hooks/useСameraStream";
//types
import { DealerMode, CameraType } from "../types/shared.types";

const Scanner = lazy(() => import("../components/Scanner/Scanner"));

export default function DealerScannerPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [searchParams] = useSearchParams();
  const peerId = searchParams.get("peerId");

  const cameraManager = useCameraStream({
    peerIdFromUrl: peerId || undefined,
    streamMode: DealerMode.dealer_remote,
  });

  if (!peerId) {
    return (
      <div style={{ color: "#fff", padding: "20px" }}>
        Помилка: Не вказано peerId у URL
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <Scanner stream={cameraManager.streamDesk!} isScannerEnabled={true} />
        <SettingsComponent onSettingsClick={() => setShowSettings(true)} />
        {showSettings && (
          <ScannerSettingsModal
            onClose={() => setShowSettings(false)}
            onChangeDevice={cameraManager.changeCamera}
            cameraType={CameraType.table}
            devices={cameraManager.devices}
            selectedDeviceId={cameraManager.selectedDeskId}
          />
        )}
      </Suspense>
    </div>
  );
}
