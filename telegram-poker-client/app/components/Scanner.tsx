import React, { useRef, useEffect, useState } from "react";
import * as styledImport from "styled-components";

const styled = (styledImport.default || styledImport) as any;
const s = styled;

interface ScannerProps {
  cameraLabel: string;
  externalStream?: MediaStream | null;
  isScannerEnabled: boolean;
  isMirrored?: boolean;
}

// Стили для HUD (Heads-Up Display)
const ScannerContainer = s.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
`;

const Video = s.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScanOverlay = s.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none; // Чтобы клики проходили сквозь HUD
`;

const ScanTarget = s.div`
  width: 200px;
  height: 300px;
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

export const Scanner: React.FC<ScannerProps> = ({
  cameraLabel,
  externalStream,
  isScannerEnabled,
  isMirrored,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [cardColor, setCardColor] = useState<string | null>(null);

  // Get list of cameras on component mount
  useEffect(() => {
    async function getCameras() {
      // Request camera access to get device labels (some browsers require this)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        console.log(stream);

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setSelectedDeviceId(stream.id);
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    }
    getCameras();
  }, []);

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

  const analyzeZone = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        // Размеры рамки (соответствуют CSS)
        const rectWidth = 200;
        const rectHeight = 300;

        // Вычисляем координаты центра
        const startX = (video.videoWidth - rectWidth) / 2;
        const startY = (video.videoHeight - rectHeight) / 2;

        canvas.width = rectWidth;
        canvas.height = rectHeight;

        // 1. Вырезаем зону из видео и рисуем на канвас
        ctx.drawImage(
          video,
          startX,
          startY,
          rectWidth,
          rectHeight,
          0,
          0,
          rectWidth,
          rectHeight,
        );

        // 2. Берем центральный пиксель для анализа цвета
        const pixel = ctx.getImageData(
          rectWidth / 2,
          rectHeight / 2,
          1,
          1,
        ).data;
        const [r, g, b] = pixel;

        // 3. Простая логика определения цвета
        if (r > 150 && g < 100 && b < 100) {
          setCardColor("RED (Hearts/Diamonds)");
        } else if (r < 100 && g < 100 && b < 100) {
          setCardColor("BLACK (Spades/Clubs)");
        } else {
          setCardColor(null);
        }
      }
    }
  };

  // Запускаем анализ по таймеру (например, 2 раза в секунду)
  useEffect(() => {
    const interval = setInterval(analyzeZone, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScannerContainer>
      <Video
        ref={videoRef}
        style={{ transform: isMirrored ? "scaleX(-1)" : "scaleX(1)" }}
        playsInline
        autoPlay
        muted
      />
      <div
        style={{
          position: "absolute",
          top: "2%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "16px 16px",
        }}
      >
        <select
          name="Devices"
          id="mediaDeviceSelect"
          onChange={(e) => changeCamera(e.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      {isScannerEnabled && (
        <ScanOverlay>
          <ScanTarget />
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "10px",
              marginTop: "20px",
              borderRadius: "8px",
            }}
          >
            Detected:{" "}
            <strong>{cardColor ? cardColor : "Card not recognized"}</strong>
          </div>
        </ScanOverlay>
      )}
      {/* Скрытый канвас для обработки */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </ScannerContainer>
  );
};
