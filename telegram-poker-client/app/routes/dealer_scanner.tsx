import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router";
//types
import { CameraType } from "~/types/dealerTypes";

const Scanner = lazy(() => import("../components/Scanner/Scanner"));

export default function DealerScannerPage() {
  const [searchParams] = useSearchParams();
  const peerId = searchParams.get("peerId");
  return (
    <div style={{ height: "100vh" }}>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <Scanner
          cameraType={CameraType.table}
          isScannerEnabled={true}
          peerId={peerId || undefined}
        />
      </Suspense>
    </div>
  );
}
