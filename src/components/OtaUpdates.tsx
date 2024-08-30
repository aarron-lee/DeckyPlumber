import { useEffect, useState } from "react";
import { getLatestVersionNum, getServerApi, otaUpdate } from "../backend/utils";
import { useSelector } from "react-redux";
import {
  getDeviceNameSelector,
  getPluginVersionNumSelector,
} from "../redux-modules/uiSlice";
import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
} from "decky-frontend-lib";

const OtaUpdates = () => {
  const [latestVersionNum, setLatestVersionNum] = useState("");
  const installedVersionNum = useSelector(getPluginVersionNumSelector);
  const deviceName = useSelector(getDeviceNameSelector);

  useEffect(() => {
    const fn = async () => {
      const serverApi = getServerApi();

      if (serverApi) {
        const fetchedVersionNum = await getLatestVersionNum(serverApi);

        setLatestVersionNum(fetchedVersionNum);
      }
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
            onClick={() => {
              const serverApi = getServerApi();
              if (serverApi) otaUpdate(serverApi);
            }}
            layout={"below"}
          >
            {buttonText}
          </ButtonItem>
        </PanelSectionRow>
      )}
    </PanelSection>
  );
};

export default OtaUpdates;
