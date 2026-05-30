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
} from "./ScannerStyledComponent";

interface ScannerProps {
  stream: MediaStream;
  isScannerEnabled: boolean;
  isMirrored?: boolean;
}

const Scanner: React.FC<ScannerProps> = ({
  stream,
  isScannerEnabled,
  isMirrored,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cardColor, setCardColor] = useState<string | null>(null);

  // Для відображення кнопки запуску, якщо браузер заблокував автоплей
  const [needsManualStart, setNeedsManualStart] = useState(false);

  console.log(needsManualStart);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
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
  }, [stream]);

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
          <ScanTarget />
          <CardValue>
            Detected:{" "}
            <strong>{cardColor ? cardColor : "Card not recognized"}</strong>
          </CardValue>
        </ScanOverlay>
      )}
      {/* Скрытый канвас для обработки */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </ScannerContainer>
  );
};

export default Scanner;
