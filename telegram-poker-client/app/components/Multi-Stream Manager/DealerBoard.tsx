import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

//components
import DualCameraDashBoard from "./DualCameraDashBoard";

//modals
import DealerSetupModal from "../modals/Users/DealerModeModal";
import DevicesPeerModal from "../modals/Users/DevicesPeerModal";

//types
import { DealerMode } from "../../types/shared.types";

const DealerBoard = () => {
  const [mode, setMode] = useState<DealerMode | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerRef = useRef<Peer | null>(null);

  useEffect(() => {
    if (mode === DealerMode.dealer_remote) {
      // 1. Генеруємо випадковий ID для цього сеансу
      const id = "dealer-" + Math.random().toString(36).substr(2, 9);
      setPeerId(id);

      // 2. Ініціалізуємо Peer
      const peer = new Peer(id);
      peerRef.current = peer;

      peer.on("open", (id) => console.log("Мій Peer ID:", id));

      // 3. Чекаємо на "дзвінок" від другого пристрою
      peer.on("call", (call) => {
        call.answer(); // Відповідаємо без свого відео
        call.on("stream", (stream) => {
          console.log("Отримано потік зі сканера!");
          setRemoteStream(stream);
        });
      });

      return () => {
        peer.destroy();
      };
    }
  }, [mode]);

  switch (mode) {
    case DealerMode.dealer_local:
      return <DualCameraDashBoard dealerMode={mode} />;
    case DealerMode.dealer_remote:
      return (
        <>
          <DualCameraDashBoard
            dealerMode={mode}
            externalStream={remoteStream || undefined}
          />
          {!remoteStream && <DevicesPeerModal peerId={peerId} />}
        </>
      );
    default:
      return <DealerSetupModal onSelect={(mode) => setMode(mode)} />;
  }
};

export default DealerBoard;
