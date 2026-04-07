import { FC } from "react";
import { useSelector } from "react-redux";
import { DropdownItem } from "@decky/ui";
import { useControllerMode } from "../../hooks/controller";
import { L } from "../../i18n";
import { t } from "i18next";
import { getControllerModeOptionsSelector } from "../../redux-modules/uiSlice";
import { ControllerModeOption } from "../../backend/constants";

const ControllerModeDropdown: FC = () => {
  const [mode, setMode] = useControllerMode();

  const options = useSelector(getControllerModeOptionsSelector);

  return (
    <DropdownItem
      label={t(L.CONTROLLER_MODE)}
      selectedOption={mode}
      rgOptions={options}
      onChange={(option: ControllerModeOption) => setMode(option.data)}
      bottomSeparator="none"
    />
  );
};

export default ControllerModeDropdown;
