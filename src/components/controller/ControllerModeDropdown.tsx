import { FC } from "react";
import { DropdownItem } from "@decky/ui";
import { useControllerMode } from "../../hooks/controller";
import { ControllerModes } from "../../backend/constants";
import { L } from "../../i18n";
import { t } from "i18next";

const MODE_OPTIONS = [
  { data: ControllerModes.DEFAULT, label: "Default" },
  { data: ControllerModes.XBOX, label: "Xbox Series" },
  { data: ControllerModes.XBOX_ELITE, label: "Xbox Elite" },
  { data: ControllerModes.DUAL_SENSE, label: "DualSense" },
  { data: ControllerModes.DUAL_SENSE_EDGE, label: "DualSense Edge" },
  { data: ControllerModes.HORI_STEAM, label: "Hori Steam" },
  { data: ControllerModes.STEAM_DECK, label: "Steam Deck" },
];

const ControllerModeDropdown: FC = () => {
  const [mode, setMode] = useControllerMode();

  return (
    <DropdownItem
      label={t(L.CONTROLLER_MODE)}
      selectedOption={mode}
      rgOptions={MODE_OPTIONS}
      onChange={(option) => setMode(option.data)}
      bottomSeparator="none"
    />
  );
};

export default ControllerModeDropdown;
