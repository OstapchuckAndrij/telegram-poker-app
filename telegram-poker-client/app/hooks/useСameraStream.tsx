import { useState, useRef, useEffect } from "react";
import { CameraType, DealerMode, UserMode } from "~/types/shared.types";

interface UseCameraStreamResult {
  streamDesk: MediaStream | null;
  streamFace: MediaStream | null;
  selectedDeskId: string;
  selectedFaceId: string;
  devices: MediaDeviceInfo[];
  needsManualStart: boolean;
  setNeedsManualStart: React.Dispatch<React.SetStateAction<boolean>>;
  changeCamera: (type: CameraType, deviceId: string) => Promise<void>;
}

interface UseCameraStreamProps {
  peerIdFromUrl?: string;
  streamMode: DealerMode | UserMode;
}

export const useCameraStream = ({
  peerIdFromUrl,
  streamMode,
}: UseCameraStreamProps): UseCameraStreamResult => {
  const peerInstanceRef = useRef<any>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [needsManualStart, setNeedsManualStart] = useState(false);

  const [streamDesk, setStreamDesk] = useState<MediaStream | null>(null);
  const [streamFace, setStreamFace] = useState<MediaStream | null>(null);

  const [selectedDeskId, setSelectedDeskId] = useState<string>("");
  const [selectedFaceId, setSelectedFaceId] = useState<string>("");

  //Ініціалізація локальних камер АБО PeerJS (Транслятор-телефон)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getAvailableDevices = async () => {
      try {
        // Тимчасовий запит, щоб отримати дозволи на мітки (labels)
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        tempStream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);
      } catch (err) {
        console.error("Помилка отримання списку камер:", err);
      }
    };

    getAvailableDevices();
  }, []);

  // 2. Ініціалізація потоків залежно від режиму
  useEffect(() => {
    if (typeof window === "undefined") return;

    // РЕЖИМ 1: Локальний (один комп'ютер + дві камери в USB)
    const initLocalStreams = async () => {
      try {
        // Якщо камери вже ініціалізовані, не робимо цього знову
        if (streamDesk || streamFace) return;

        // Запуск камери столу (дефолтна задня або перша ліпша)
        const desk = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setStreamDesk(desk);
        setSelectedDeskId(
          desk.getVideoTracks()[0]?.getSettings().deviceId || "",
        );

        // Запуск камери обличчя (дефолтна фронтальна)
        const face = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        setStreamFace(face);
        setSelectedFaceId(
          face.getVideoTracks()[0]?.getSettings().deviceId || "",
        );
      } catch (err) {
        console.error("Помилка ініціалізації локальних камер:", err);
      }
    };

    // РЕЖИМ 2: Дистанційний сканер (телефон, що надсилає відео)
    const initRemoteScanner = async () => {
      if (!peerIdFromUrl) return;
      try {
        const { default: Peer } = await import("peerjs");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        setStreamDesk(stream); // Для телефону його камера є камерою столу

        const peer = new Peer();
        peerInstanceRef.current = peer;
        peer.on("open", () => {
          peer.call(peerIdFromUrl, stream, {
            sdpTransform: (sdp: any) => sdp.replace("b=AS:30", "b=AS:4000"),
          });
        });
      } catch (err) {
        console.error("Помилка відправки потоку з телефону:", err);
      }
    };

    if (streamMode === DealerMode.dealer_local) {
      initLocalStreams();
    } else if (peerIdFromUrl) {
      initRemoteScanner();
    }

    return () => {
      if (peerInstanceRef.current) peerInstanceRef.current.destroy();
    };
  }, [streamMode, peerIdFromUrl]);

  // 3. Функція зміни конкретної камери (для модалки налаштувань)
  const changeCamera = async (type: CameraType, deviceId: string) => {
    try {
      const constraints = { video: { deviceId: { exact: deviceId } } };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === CameraType.table) {
        if (streamDesk) streamDesk.getTracks().forEach((t) => t.stop());
        setStreamDesk(newStream);
        setSelectedDeskId(deviceId);
      } else {
        if (streamFace) streamFace.getTracks().forEach((t) => t.stop());
        setStreamFace(newStream);
        setSelectedFaceId(deviceId);
      }
    } catch (err) {
      alert("Не вдалося змінити камеру: " + err);
    }
  };

  return {
    devices,
    streamDesk,
    streamFace,
    selectedDeskId,
    selectedFaceId,
    needsManualStart,
    setNeedsManualStart,
    changeCamera,
  };
};
