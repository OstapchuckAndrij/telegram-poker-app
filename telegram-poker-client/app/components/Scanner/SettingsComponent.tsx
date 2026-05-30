//components
import { Settings, PictureInPicture2, PanelsTopLeft } from "lucide-react";
import { ControlsContainer } from "./ScannerStyledComponent";
//types
import { LayoutType } from "~/types/shared.types";

interface SettingsComponentProps {
  layoutType?: LayoutType;
  onToggleLayout?: () => void;
  onSettingsClick: () => void;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({
  layoutType,
  onToggleLayout,
  onSettingsClick,
}) => {
  return (
    <ControlsContainer>
      {layoutType &&
        onToggleLayout &&
        (layoutType === LayoutType.split ? (
          <PanelsTopLeft
            size={24}
            color="#414040"
            onClick={() => onToggleLayout()}
          />
        ) : (
          <PictureInPicture2
            size={24}
            color="#414040"
            onClick={() => onToggleLayout()}
          />
        ))}
      <Settings size={24} color="#414040" onClick={() => onSettingsClick()} />
    </ControlsContainer>
  );
};

export default SettingsComponent;
