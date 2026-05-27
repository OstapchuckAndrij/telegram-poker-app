import React, { useRef, useEffect, useState } from "react";

//utils
import { analyzeZone } from "../../utils/AnylyzerUtil";

//components
import {
  ScannerContainer,
  Video,
  ScanOverlay,
  ScanTarget,
  CardValue,
  ControlsContainer,
} from "./ScannerStyledComponent";
import SettingsComponent from "./SettingsComponent";

//modals
import ScannerSettingsModal from "../modals/Scanner/ScannerSettingsModal";

//types
import { CameraType, DealerMode } from "../../types/dealerTypes";

interface ScannerProps {
  cameraType: CameraType;
  dealerMode?: DealerMode;
  externalStream?: MediaStream | null;
  isScannerEnabled: boolean;
  isMirrored?: boolean;
  peerId?: string;
}

const Scanner: React.FC<ScannerProps> = ({
  cameraType,
  dealerMode,
  externalStream,
  isScannerEnabled,
  isMirrored,
  peerId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [cardColor, setCardColor] = useState<string | null>(null);

  // Для відображення кнопки запуску, якщо браузер заблокував автоплей
  const [needsManualStart, setNeedsManualStart] = useState(false);
  // Для показу/приховування налаштувань
  const [showSettings, setShowSettings] = useState(false);

  // Get list of cameras on component mount
  useEffect(() => {
    const initScanner = async () => {
      try {
        const { default: Peer } = await import("peerjs"); // Динамічний імпорт

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) videoRef.current.srcObject = stream;

        const peer = new Peer();
        if (!peerId) {
          alert("Peer ID не передано в URL");
          return;
        }
        peer.on("open", () => {
          peer.call(peerId, stream, {
            sdpTransform: (sdp: any) => {
              // Цей хак "підіймає" бітрейт відео в протоколі з'єднання
              return sdp.replace("b=AS:30", "b=AS:4000"); // Збільшуємо до 4Mbps
            },
          });
        });
      } catch (err) {
        alert("Помилка: " + err);
      }
    };

    async function getCameras() {
      // Request camera access to get device labels (some browsers require this)
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
          // Отримуємо ID камери, яка зараз використовується
          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();
          setSelectedDeviceId(settings.deviceId || "");
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    }
    if (peerId) {
      initScanner();
      return;
    } else {
      getCameras();
    }
  }, [peerId]);

  const changeCamera = async (deviceId: string) => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Повністю зупиняємо старий потік
    const currentStream = video.srcObject as MediaStream;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Track ${track.label} stopped`);
      });
      video.srcObject = null; // Обов'язково зануляємо
    }

    // 2. Невелика пауза (даємо Android час звільнити камеру)
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const constraints = { video: { deviceId: { exact: deviceId } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      video.srcObject = stream;

      // Деяким Android пристроям потрібно явно викликати play()
      video.onloadedmetadata = () => {
        video.play().catch((e) => console.error("Play error:", e));
      };
    } catch (err: any) {
      console.error("Помилка при зміні камери:", err);
      alert(`Не вдалося змінити камеру: ${err.name}`);
      changeCamera(selectedDeviceId);
      return;
    }
    setSelectedDeviceId(deviceId);
  };

  console.log(needsManualStart);

  useEffect(() => {
    if (externalStream && videoRef.current) {
      console.log("Прийшов зовнішній потік, підключаю...");
      videoRef.current.srcObject = externalStream;
      // Важливо для Safari та Chrome на мобільних
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          setNeedsManualStart(true); // Браузер заблокував, показуємо кнопку
        }
      };
      playVideo();
    }
  }, [externalStream]);

  // Запускаем анализ по таймеру (например, 2 раза в секунду)
  useEffect(() => {
    const interval = setInterval(async () => {
      const color = await analyzeZone(videoRef.current, canvasRef.current);
      setCardColor(color);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScannerContainer>
      <Video
        ref={videoRef}
        style={{
          transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
          cursor: "pointer",
        }}
        playsInline
        autoPlay
        muted // М'ют обов'язковий для автоплею!
      />
      {isScannerEnabled && (
        <ScanOverlay>
          {needsManualStart && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.8)",
                zIndex: 50,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  videoRef.current?.play();
                  setNeedsManualStart(false);
                }}
                style={{
                  padding: "15px 30px",
                  background: "#0f0",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                УВІМКНУТИ КАМЕРУ СТОЛУ
              </button>
            </div>
          )}
          {/* <ControlsContainer>
            <select
              name="Devices"
              id="mediaDeviceSelect"
              value={selectedDeviceId}
              onChange={(e) => changeCamera(e.target.value)}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
            <p>{cameraLabel}</p>
          </ControlsContainer> */}
          {/* <SettingsComponent onSettingsClick={() => setShowSettings(true)} /> */}
          <ScanTarget />
          <CardValue>
            Detected:{" "}
            <strong>{cardColor ? cardColor : "Card not recognized"}</strong>
          </CardValue>
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
        </ScanOverlay>
      )}
      {/* Скрытый канвас для обработки */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </ScannerContainer>
  );
};

export default Scanner;
