import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux-modules/store";
import {
  controllerSlice,
  selectAdvancedOptionsInfo,
} from "../../redux-modules/controllerSlice";
import { get } from "lodash";
import ErrorBoundary from "../ErrorBoundary";
import { PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
PanelSectionRow;

const Options = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { advancedState, advancedOptions } = useSelector(
    selectAdvancedOptionsInfo
  );

  if (advancedOptions.length === 0) {
    return null;
  }

  return (
    <PanelSection title="Options">
      <ErrorBoundary title="Options">
        {advancedOptions.map((option, idx) => {
          const { name, type, statePath, defaultValue, description } = option;
          const value = get(advancedState, statePath, defaultValue);

          if (type === "boolean") {
            return (
              <PanelSectionRow>
                <ToggleField
                  key={idx}
                  label={name}
                  checked={value}
                  description={description}
                  highlightOnFocus
                  bottomSeparator="none"
                  onChange={(enabled: boolean) => {
                    return dispatch(
                      controllerSlice.actions.updateAdvancedOption({
                        statePath,
                        value: enabled,
                      })
                    );
                  }}
                />
              </PanelSectionRow>
            );
          }

          return null;
        })}
      </ErrorBoundary>
    </PanelSection>
  );
};

export default Options;
