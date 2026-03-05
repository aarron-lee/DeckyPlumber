import { FC } from "react";
import ControllerModeDropdown from "./ControllerModeDropdown";
import { PanelSectionRow } from "@decky/ui";

export const ControllerSettings: FC = () => {
  return (
    <PanelSectionRow>
      <ControllerModeDropdown />
    </PanelSectionRow>
  );
};
