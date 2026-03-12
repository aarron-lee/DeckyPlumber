import { useEffect, useState } from "react";
import { getLatestVersionNum, otaUpdate } from "../backend/utils";
import { useSelector } from "react-redux";
import {
  getDeviceNameSelector,
  getPluginVersionNumSelector,
} from "../redux-modules/uiSlice";
import { ButtonItem, Field, Navigation, PanelSection, PanelSectionRow } from "@decky/ui";
import { DECKY_PLUMBER_ROUTE } from "../consts";
import { L } from "../i18n";
import { t } from "i18next";

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

  let buttonText = t(L.UPDATE_TO, { version: latestVersionNum });

  if (installedVersionNum === latestVersionNum && Boolean(latestVersionNum)) {
    buttonText = t(L.REINSTALL_PLUGIN);
  }

  return (
    <PanelSection title={t(L.UPDATES)}>
      <PanelSectionRow>
        <Field label={t(L.INSTALLED_VERSION)}>{installedVersionNum}</Field>
      </PanelSectionRow>

      {Boolean(latestVersionNum) && (
        <PanelSectionRow>
          <Field label={t(L.LATEST_VERSION)}>{latestVersionNum}</Field>
        </PanelSectionRow>
      )}
      {Boolean(deviceName) && (
        <PanelSectionRow>
          <Field label={t(L.DEVICE_NAME)}>{deviceName}</Field>
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
            {isUpdating ? t(L.UPDATING) : buttonText}
          </ButtonItem>
        </PanelSectionRow>
      )}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Navigation.Navigate(`${DECKY_PLUMBER_ROUTE}/about`);
            Navigation.CloseSideMenus();
          }}
        >
          {t(L.ABOUT)}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default OtaUpdates;
