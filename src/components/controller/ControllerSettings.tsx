import { FC } from "react";
import ControllerModeSlider from "./ControllerModeSlider";
import { PanelSectionRow } from "@decky/ui";

export const ControllerSettings: FC = () => {
  return (
    <PanelSectionRow>
      <ControllerModeSlider />
    </PanelSectionRow>
  );
};
