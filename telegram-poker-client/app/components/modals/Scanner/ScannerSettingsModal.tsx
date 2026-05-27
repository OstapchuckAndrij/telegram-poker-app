import { useState } from "react";

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
import { X } from "lucide-react";
//types
import { CameraType, DealerMode } from "../../../types/dealerTypes";
//constants
import { LocalDualWarning, RemoteDualWarning } from "../../../constants/const";

interface ScannerSettingsModalProps {
  cameraType: CameraType;
  dealerMode?: DealerMode;
  selectedDeviceId?: string;
  devices: MediaDeviceInfo[];
  onChangeDevice: (deviceId: string) => void;
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
            styles={ControlsButton(buttonColors.red)}
            onClick={() => {
              onClose();
            }}
          >
            <X />
          </ModalButton>
        </ModalHeader>
        <ModalContent>
          {devices && (
            <>
              <Text>
                {dealerMode === DealerMode.local_dual
                  ? LocalDualWarning
                  : RemoteDualWarning}
              </Text>
              <OptionCardList
                $isSelected={open}
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <h4>Доступні камери</h4>
                <p>
                  Обрана камера:{" "}
                  {devices.find((d) => d.deviceId === selectedDeviceId)
                    ?.label || "Невідоме пристрій"}{" "}
                </p>
                {open && (
                  <>
                    {devices.map((device) => (
                      <OptionCard
                        key={device.deviceId}
                        onClick={() => {
                          onChangeDevice(device.deviceId);
                          setOpen(false);
                        }}
                      >
                        <h4>{device.label || "Невідоме пристрій"}</h4>
                      </OptionCard>
                    ))}
                  </>
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
