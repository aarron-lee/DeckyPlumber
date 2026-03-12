import { FC } from "react";
import {
  DialogBody,
  DialogControlsSection,
  DialogControlsSectionHeader,
  Field,
  Navigation,
} from "@decky/ui";
import { FiGithub } from "react-icons/fi";
import { useSelector } from "react-redux";
import {
  getPluginVersionNumSelector,
  getDeviceNameSelector,
} from "../redux-modules/uiSlice";
import { L } from "../i18n";
import { t } from "i18next";

const DescriptionField: FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Field
    label={
      <div style={{ display: "block" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: 0 }}>
          {label}
        </h2>
        <br />
        {children}
      </div>
    }
    focusable
  />
);

const AboutPage: FC = () => {
  const version = useSelector(getPluginVersionNumSelector);
  const deviceName = useSelector(getDeviceNameSelector);

  return (
    <DialogBody>
      <DialogControlsSection>
        <DescriptionField label="DeckyPlumber">
          {t(L.ABOUT_DESC)}
          <br />
          <i>{t(L.ABOUT_DETAIL)}</i>
        </DescriptionField>
        <Field label={t(L.PLUGIN_VERSION)} focusable>
          {version || t(L.UNKNOWN)}
        </Field>
        {deviceName && (
          <Field label={t(L.DEVICE)} focusable>
            {deviceName}
          </Field>
        )}
        <Field
          icon={<FiGithub style={{ display: "block" }} />}
          label="aarron-lee/DeckyPlumber"
          onClick={() => {
            Navigation.NavigateToExternalWeb(
              "https://github.com/aarron-lee/DeckyPlumber"
            );
          }}
        >
          {t(L.GITHUB_REPO)}
        </Field>
      </DialogControlsSection>

      <DialogControlsSection>
        <DialogControlsSectionHeader>{t(L.DEPENDENCY)}</DialogControlsSectionHeader>
        <DescriptionField label="InputPlumber">
          {t(L.INPUTPLUMBER_DESC)}
          <br />
          <i>{t(L.POWERED_BY)}</i>
        </DescriptionField>
        <Field
          icon={<FiGithub style={{ display: "block" }} />}
          label="ShadowBlip/InputPlumber"
          onClick={() => {
            Navigation.NavigateToExternalWeb(
              "https://github.com/ShadowBlip/InputPlumber"
            );
          }}
        >
          {t(L.GITHUB_REPO)}
        </Field>
      </DialogControlsSection>
    </DialogBody>
  );
};

export default AboutPage;
