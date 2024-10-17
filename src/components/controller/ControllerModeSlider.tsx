import { FC } from "react";
import { SliderField, NotchLabel } from "@decky/ui";
import { useControllerMode } from "../../hooks/controller";
import { capitalize } from "lodash";
import { ControllerModes } from "../../backend/constants";

enum Mode {
  DEFAULT = 0,
  XBOX,
  DUAL_SENSE,
  DUAL_SENSE_EDGE,
  STEAM_DECK,
  XBOX_ELITE,
}

const ModeToKey = {
  default: "DEFAULT",
  xb360: "XBOX",
  ds5: "DUAL_SENSE",
  "ds5-edge": "DUAL_SENSE_EDGE",
  deck: "STEAM_DECK",
  "xbox-elite": "XBOX_ELITE",
};

const ControllerModeSlider: FC = () => {
  const [mode, setMode] = useControllerMode();

  const handleSliderChange = (value: number) => {
    const key = Mode[value] as
      | "DEFAULT"
      | "XBOX"
      | "DUALSENSE"
      | "DUALSENSE_EDGE"
      | "STEAM_DECK"
      | "XBOX_ELITE";

    return setMode(ControllerModes[key]);
  };

  const MODES: NotchLabel[] = Object.keys(Mode)
    .filter((key) => isNaN(Number(key)))
    .map((mode, idx) => {
      return {
        notchIndex: idx,
        label: capitalize(mode.split("_").join(" ")),
        value: idx,
      };
    });

  // known bug: typescript has incorrect type for reverse mapping from enums
  const sliderValue = Mode[ModeToKey[mode]] as any;

  return (
    <>
      <SliderField
        value={sliderValue}
        min={0}
        max={MODES.length - 1}
        step={1}
        notchCount={MODES.length}
        notchLabels={MODES}
        notchTicksVisible={true}
        showValue={false}
        bottomSeparator={"none"}
        onChange={handleSliderChange}
      />
    </>
  );
};

export default ControllerModeSlider;
