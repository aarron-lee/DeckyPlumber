import { FC } from "react";
import { usePerGameProfilesEnabled } from "../../hooks/controller";
import { PanelSectionRow, ToggleField } from "@decky/ui";

export const PerGameProfilesToggle: FC = () => {
  const [perGameProfilesEnabled, setPerGameProfilesEnabled] =
    usePerGameProfilesEnabled();

  return (
    <PanelSectionRow>
      <ToggleField
      label="Enable Per Game Profiles"
      checked={perGameProfilesEnabled}
      onChange={setPerGameProfilesEnabled}
      />
    </PanelSectionRow>
  );
};
