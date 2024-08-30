import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { ControllerModes } from "../backend/constants";
import {
  controllerSlice,
  selectControllerInfo,
  selectControllerProfileDisplayName,
  selectPerGameProfilesEnabled,
  selectControllerMode,
} from "../redux-modules/controllerSlice";

export const useControllerMode = () => {
  const mode = useSelector(selectControllerMode);
  const dispatch = useDispatch();

  const setMode = useCallback((mode: ControllerModes) => {
    return dispatch(controllerSlice.actions.setControllerMode({ mode }));
  }, []);

  return [mode, setMode] as any;
};

export const usePerGameProfilesEnabled = () => {
  const isEnabled = useSelector(selectPerGameProfilesEnabled);
  const dispatch = useDispatch();

  const setEnabled = useCallback((enabled: boolean) => {
    return dispatch(controllerSlice.actions.setPerGameProfilesEnabled(enabled));
  }, []);

  return [isEnabled, setEnabled] as any;
};

export const useProfileDisplayName = () =>
  useSelector(selectControllerProfileDisplayName);
