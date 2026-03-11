import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import {
  controllerSlice,
  selectActiveProfiles,
  selectMappingProfiles,
} from "../../redux-modules/controllerSlice";

const MappingProfiles: FC = () => {
  const dispatch = useDispatch();
  const mappingProfiles = useSelector(selectMappingProfiles);
  const activeProfiles = useSelector(selectActiveProfiles);

  if (!mappingProfiles || mappingProfiles.length === 0) {
    return null;
  }

  return (
    <PanelSection title="Mapping Profiles">
      {mappingProfiles.map((profile) => (
        <PanelSectionRow key={profile.id}>
          <ToggleField
            label={profile.name}
            description={profile.description || undefined}
            checked={activeProfiles.includes(profile.id)}
            onChange={(checked) => {
              dispatch(
                controllerSlice.actions.toggleMappingProfile({
                  profileId: profile.id,
                  enabled: checked,
                })
              );
            }}
          />
        </PanelSectionRow>
      ))}
    </PanelSection>
  );
};

export default MappingProfiles;
