import { PanelSection } from "@decky/ui";
import { VFC } from "react";
import { useProfileDisplayName } from "../../hooks/controller";
import { PerGameProfilesToggle } from "./PerGameProfilesToggle";
import { ControllerSettings } from "./ControllerSettings";

const ControllerPanel: VFC = () => {
  const displayName = useProfileDisplayName();

  let title =
    displayName === "Default"
      ? "Controller"
      : `Controller - ${displayName.substring(0, 10)}...`;

  return (
    <PanelSection title={title}>
      <PerGameProfilesToggle />
      <ControllerSettings />
    </PanelSection>
  );
};

export default ControllerPanel;
