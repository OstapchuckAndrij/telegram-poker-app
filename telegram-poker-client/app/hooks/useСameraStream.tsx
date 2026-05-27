import { useState, useRef, useEffect, use } from "react";

interface UseCameraStreamResult {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  needsManualStart: boolean;
  setNeedsManualStart: React.Dispatch<React.SetStateAction<boolean>>;
  changeCamera: (deviceId: string) => Promise<void>;
}

interface UseCameraStreamProps {
  peerId?: string;
  externalStream?: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const useCameraStream = ({
  peerId,
  externalStream,
  videoRef,
}: UseCameraStreamProps): UseCameraStreamResult => {
  const peerInstanceRef = useRef<any>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [needsManualStart, setNeedsManualStart] = useState(false);
  //Ініціалізація локальних камер АБО PeerJS (Транслятор-телефон)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initScanner = async () => {
      try {
        const { default: Peer } = await import("peerjs");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) videoRef.current.srcObject = stream;

        if (!peerId) {
          alert("Peer ID не передано в URL");
          return;
        }

        const peer = new Peer();
        peerInstanceRef.current = peer;

        peer.on("open", () => {
          peer.call(peerId, stream, {
            sdpTransform: (sdp: any) => sdp.replace("b=AS:30", "b=AS:4000"),
          });
        });

        peer.on("error", (err) => console.error("PeerJS Error:", err));
      } catch (err) {
        alert("Помилка ініціалізації Peer: " + err);
      }
    };

    async function getCameras() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack?.getSettings();
          setSelectedDeviceId(settings?.deviceId || "");
        }
      } catch (err) {
        console.error("Помилка доступу до камери:", err);
      }
    }

    if (peerId) {
      initScanner();
    } else if (!externalStream) {
      getCameras();
    }

    return () => {
      // Чистимо Peer, якщо компонент розмонтовується
      if (peerInstanceRef.current) {
        peerInstanceRef.current.destroy();
      }
    };
  }, [peerId, externalStream, videoRef]);

  // 2. Обробка зовнішнього потоку (Дилер-комп'ютер)
  useEffect(() => {
    if (externalStream && videoRef.current) {
      console.log("Прийшов зовнішній потік, підключаю...");
      videoRef.current.srcObject = externalStream;

      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          setNeedsManualStart(true);
        }
      };
      playVideo();
    }
  }, [externalStream, videoRef]);

  // 3. Функція зміни камери
  const changeCamera = async (deviceId: string) => {
    const video = videoRef.current;
    if (!video) return;

    const currentStream = video.srcObject as MediaStream;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const constraints = { video: { deviceId: { exact: deviceId } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play().catch((e) => console.error("Play error:", e));
      };
      setSelectedDeviceId(deviceId);
    } catch (err: any) {
      console.error("Помилка при зміні камери:", err);
      alert(`Не вдалося змінити камеру: ${err.name}`);
      // Фолбек на попередню робочу камеру
      if (selectedDeviceId) changeCamera(selectedDeviceId);
    }
  };

  return {
    devices,
    selectedDeviceId,
    needsManualStart,
    setNeedsManualStart,
    changeCamera,
  };
};
