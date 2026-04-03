import { FC, useState, useEffect } from "react";
import { DropdownItem } from "@decky/ui";
import { useControllerMode } from "../../hooks/controller";
import { ControllerModes } from "../../backend/constants";
import { L } from "../../i18n";
import { t } from "i18next";
import { getSupportedTargets } from "../../backend/utils";

const ALL_MODE_OPTIONS = [
  { data: ControllerModes.DEFAULT, label: "Default" },
  { data: ControllerModes.XBOX, label: "Xbox Series" },
  { data: ControllerModes.XBOX_ELITE, label: "Xbox Elite" },
  { data: ControllerModes.DUAL_SENSE, label: "DualSense" },
  { data: ControllerModes.DUAL_SENSE_EDGE, label: "DualSense Edge" },
  { data: ControllerModes.HORI_STEAM, label: "Hori Steam" },
  { data: ControllerModes.STEAM_DECK, label: "Steam Deck" },
  { data: ControllerModes.BITDO_ULTIMATE_2, label: "8BitDo Ultimate 2" },
];

const ControllerModeDropdown: FC = () => {
  const [mode, setMode] = useControllerMode();
  const [supportedIds, setSupportedIds] = useState<string[] | null>(null);

  useEffect(() => {
    getSupportedTargets()
      .then((ids) => {
        if (ids && ids.length > 0) {
          setSupportedIds(ids);
        }
      })
      .catch(() => {
        // fallback: show all options
      });
  }, []);

  const options =
    supportedIds === null
      ? ALL_MODE_OPTIONS
      : ALL_MODE_OPTIONS.filter(
          (opt) =>
            opt.data === ControllerModes.DEFAULT ||
            supportedIds.includes(opt.data)
        );

  return (
    <DropdownItem
      label={t(L.CONTROLLER_MODE)}
      selectedOption={mode}
      rgOptions={options}
      onChange={(option) => setMode(option.data)}
      bottomSeparator="none"
    />
  );
};

export default ControllerModeDropdown;
