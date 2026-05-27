import { QRCodeSVG } from "qrcode.react";

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
  const scannerUrl = `${window.location.origin}/dealer/scanner?peerId=${peerId}`;

  return (
    <ModalOverlay>
      <ModalContainer>
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
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DevicesPeerModal;
