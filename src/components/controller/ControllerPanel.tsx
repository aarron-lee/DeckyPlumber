import { PanelSection } from "@decky/ui";
import { VFC } from "react";
import { useProfileDisplayName } from "../../hooks/controller";
import { PerGameProfilesToggle } from "./PerGameProfilesToggle";
import { ControllerSettings } from "./ControllerSettings";
import { L } from "../../i18n";
import { t } from "i18next";

const ControllerPanel: VFC = () => {
  const displayName = useProfileDisplayName();

  let title =
    displayName === "Default"
      ? t(L.CONTROLLER)
      : t(L.CONTROLLER_WITH_NAME, { name: displayName.substring(0, 10) });

  return (
    <PanelSection title={title}>
      <PerGameProfilesToggle />
      <ControllerSettings />
    </PanelSection>
  );
};

export default ControllerPanel;
