import { FC } from "react";
import { usePerGameProfilesEnabled } from "../../hooks/controller";
import { PanelSectionRow, ToggleField } from "@decky/ui";
import { L } from "../../i18n";
import { t } from "i18next";

export const PerGameProfilesToggle: FC = () => {
  const [perGameProfilesEnabled, setPerGameProfilesEnabled] =
    usePerGameProfilesEnabled();

  return (
    <PanelSectionRow>
      <ToggleField
      label={t(L.ENABLE_PER_GAME_PROFILES)}
      checked={perGameProfilesEnabled}
      onChange={setPerGameProfilesEnabled}
      />
    </PanelSectionRow>
  );
};
