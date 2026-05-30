import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

//modals
import {
  ModalContent,
  ModalOverlay,
  ModalContainer,
} from "../ModalStyledComponent";

interface DevicesPeerProps {
  peerId: string;
}

const DevicesPeerModal: React.FC<DevicesPeerProps> = ({ peerId }) => {
  // Створюємо унікальне посилання для другого пристрою
  const [scannerUrl, setScannerUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScannerUrl(
        `${window.location.origin}/dealer/scanner?peerId=${peerId}`,
      );
    }
  }, [peerId]);

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>
          <h3>Підключіть Сканер</h3>
          <p style={{ marginBottom: "20px", color: "#aaa" }}>
            Відскануйте QR-код іншим телефоном, щоб активувати камеру столу
          </p>
          <div
            style={{
              background: "#white",
              padding: "15px",
              borderRadius: "10px",
              display: "inline-block",
            }}
          >
            <QRCodeSVG value={scannerUrl} size={200} />
          </div>
          <p
            style={{
              marginTop: "20px",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            {scannerUrl}
          </p>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DevicesPeerModal;
