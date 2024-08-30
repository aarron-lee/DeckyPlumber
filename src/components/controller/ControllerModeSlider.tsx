import { FC } from "react";
import { SliderField, NotchLabel } from "decky-frontend-lib";
import { useControllerMode } from "../../hooks/controller";
import { capitalize } from "lodash";
import { ControllerModes } from "../../backend/constants";

enum Mode {
  XBOX = 0,
  DUALSENSE_EDGE = 1,
  STEAM_DECK = 2,
  XBOX_ELITE = 3,
}

const ModeToKey = {
  xb360: "XBOX",
  "ds5-edge": "DUALSENSE_EDGE",
  deck: "STEAM_DECK",
  "xbox-elite": "XBOX_ELITE",
};

const ControllerModeSlider: FC = () => {
  const [mode, setMode] = useControllerMode();

  const handleSliderChange = (value: number) => {
    const key = Mode[value] as
      | "XBOX"
      | "DUALSENSE_EDGE"
      | "STEAM_DECK"
      | "XBOX_ELITE";

    return setMode(ControllerModes[key]);
  };

  const MODES: NotchLabel[] = Object.keys(Mode)
    .filter((key) => isNaN(Number(key)))
    .map((mode, idx) => {
      return { notchIndex: idx, label: capitalize(mode), value: idx };
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
