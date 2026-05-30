import {
  ModalContainer,
  ModalContent,
  ModalOverlay,
  OptionCard,
} from "../ModalStyledComponent";
import { DealerMode } from "../../../types/shared.types";

const DealerSetup: React.FC<{
  onSelect: (mode: DealerMode) => void;
}> = ({ onSelect }) => {
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>
          <div style={{ display: "grid", gap: "15px" }}>
            <h2>Налаштування робочого місця</h2>
            <OptionCard onClick={() => onSelect(DealerMode.dealer_local)}>
              <h3>Один пристрій (PC/Mac)</h3>
              <p>Використовувати вбудовану камеру та Desk View / USB-камеру</p>
            </OptionCard>

            <OptionCard onClick={() => onSelect(DealerMode.dealer_remote)}>
              <h3>Два пристрої (Mobile/Hybrid)</h3>
              <p>
                Використовувати цей телефон для обличчя, а інший — як сканер
              </p>
            </OptionCard>
          </div>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default DealerSetup;
