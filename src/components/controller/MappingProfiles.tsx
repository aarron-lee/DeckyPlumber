import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonItem,
  Navigation,
  PanelSection,
  PanelSectionRow,
  ToggleField,
} from "@decky/ui";
import { FaFileAlt, FaFileMedical } from "react-icons/fa";
import {
  controllerSlice,
  selectActiveProfiles,
  selectCurrentProfileInfo,
  selectMappingProfiles,
  selectMergeBaseProfile,
} from "../../redux-modules/controllerSlice";
import { DECKY_PLUMBER_ROUTE } from "../../consts";

const MappingProfiles: FC = () => {
  const dispatch = useDispatch();
  const mappingProfiles = useSelector(selectMappingProfiles);
  const activeProfiles = useSelector(selectActiveProfiles);
  const mergeBase = useSelector(selectMergeBaseProfile);
  const profileInfo = useSelector(selectCurrentProfileInfo);

  return (
    <PanelSection title="Mapping">
      {mappingProfiles.map((profile) => (
        <PanelSectionRow key={profile.id}>
          <ToggleField
            icon={
              profile.isPreset
                ? <FaFileAlt style={{ display: "block", fontSize: "0.85em" }} />
                : <FaFileMedical style={{ display: "block", fontSize: "0.85em" }} />
            }
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
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Navigation.Navigate(DECKY_PLUMBER_ROUTE);
            Navigation.CloseSideMenus();
          }}
        >
          Manage
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label="Merge with base profile"
          description={profileInfo.path || "No base profile detected"}
          checked={mergeBase}
          onChange={(checked) => {
            dispatch(controllerSlice.actions.setMergeBaseProfile(checked));
          }}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default MappingProfiles;
