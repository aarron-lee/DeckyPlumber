import { useEffect, useState } from "react";
import { getLatestVersionNum, otaUpdate } from "../backend/utils";
import { useSelector } from "react-redux";
import {
  getDeviceNameSelector,
  getPluginVersionNumSelector,
} from "../redux-modules/uiSlice";
import { ButtonItem, Field, PanelSection, PanelSectionRow } from "@decky/ui";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const installedVersionNum = useSelector(getPluginVersionNumSelector);
  const deviceName = useSelector(getDeviceNameSelector);

  useEffect(() => {
    const fn = async () => {
      const fetchedVersionNum = await getLatestVersionNum();

      setLatestVersionNum(fetchedVersionNum);
    };

    fn();
  }, []);

  let buttonText = `Update to ${latestVersionNum}`;

  if (installedVersionNum === latestVersionNum && Boolean(latestVersionNum)) {
    buttonText = "Reinstall Plugin";
  }

  return (
    <PanelSection title="Updates">
      <PanelSectionRow>
        <Field label={"Installed Version"}>{installedVersionNum}</Field>
      </PanelSectionRow>

      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <Field label={"Latest Version"}>{latestVersionNum}</Field>
        </PanelSectionRow>
      )}
      {Boolean(deviceName) && (
        <PanelSectionRow>
          <Field label={"Device Name"}>{deviceName}</Field>
        </PanelSectionRow>
      )}
      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <ButtonItem
            onClick={async () => {
              setIsUpdating(true);
              await otaUpdate();
              setIsUpdating(false);
            }}
            layout={"below"}
          >
            {isUpdating ? "Updating..." : buttonText}
          </ButtonItem>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
};

export default OtaUpdates;
