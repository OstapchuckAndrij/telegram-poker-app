import { useState } from "react";
import { X } from "lucide-react";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalContent,
  OptionCard,
  OptionCardList,
  ModalButton,
  ControlsButton,
  buttonColors,
  Text,
} from "../ModalStyledComponent";
import { CameraType, DealerMode } from "../../../types/shared.types";
import { LocalDualWarning, RemoteDualWarning } from "../../../constants/const";

interface ScannerSettingsModalProps {
  cameraType: CameraType;
  dealerMode?: DealerMode;
  selectedDeviceId?: string;
  devices: MediaDeviceInfo[];
  onChangeDevice: (cameraType: CameraType, deviceId: string) => void;
  onClose: () => void;
}

const ScannerSettingsModal = ({
  cameraType,
  dealerMode,
  devices,
  selectedDeviceId,
  onChangeDevice,
  onClose,
}: ScannerSettingsModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h2>
            {cameraType === CameraType.user
              ? "Камера користувача"
              : "Камера середовища"}
          </h2>
          <ModalButton
            $dynamicStyles={ControlsButton(buttonColors.red)}
            onClick={onClose}
          >
            <X size={20} />
          </ModalButton>
        </ModalHeader>
        <ModalContent>
          {devices && (
            <>
              <Text>
                {dealerMode === DealerMode.dealer_local
                  ? LocalDualWarning
                  : RemoteDualWarning}
              </Text>
              <OptionCardList $isSelected={open} onClick={() => setOpen(!open)}>
                <h4>Доступні камери</h4>
                <p>
                  Обрана камера:{" "}
                  {devices.find((d) => d.deviceId === selectedDeviceId)
                    ?.label || "Невідомий пристрій"}
                </p>
                {open && (
                  <div
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {devices.map((device) => (
                      <OptionCard
                        key={device.deviceId}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation(); // Зупиняємо закриття списку завчасно
                          onChangeDevice(cameraType, device.deviceId);
                          setOpen(false);
                        }}
                      >
                        <h4>{device.label || "Невідомий пристрій"}</h4>
                      </OptionCard>
                    ))}
                  </div>
                )}
              </OptionCardList>
            </>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ScannerSettingsModal;
