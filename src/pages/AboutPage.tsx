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
          Decky Plugin for InputPlumber controller configuration.
          <br />
          <i>Change controller modes, manage input mapping profiles, and more.</i>
        </DescriptionField>
        <Field label="Plugin Version" focusable>
          {version || "Unknown"}
        </Field>
        {deviceName && (
          <Field label="Device" focusable>
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
          GitHub Repo
        </Field>
      </DialogControlsSection>

      <DialogControlsSection>
        <DialogControlsSectionHeader>Dependency</DialogControlsSectionHeader>
        <DescriptionField label="InputPlumber">
          Open source input router and remapper daemon for Linux.
          <br />
          <i>DeckyPlumber is powered by InputPlumber.</i>
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
          GitHub Repo
        </Field>
      </DialogControlsSection>
    </DialogBody>
  );
};

export default AboutPage;
