import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { get, merge } from "lodash";
import type { RootState } from "./store";
import { setCurrentGameId, setInitialState } from "./extraActions";
import { extractCurrentGameId } from "../backend/utils";
import { Router } from "decky-frontend-lib";
import { ControllerModes } from "../backend/constants";

type ControllerProfile = {
  mode: ControllerModes;
};

const DEFAULT_CONTROLLER_PROFILE = {
  mode: "xb360",
};

type ControllerProfiles = {
  [gameId: string]: ControllerProfile;
};

type ControllerState = {
  controllerProfiles: ControllerProfiles;
  perGameProfilesEnabled: boolean;
};

const initialState: ControllerState = {
  controllerProfiles: {},
  perGameProfilesEnabled: false,
};

const bootstrapControllerProfile = (
  state: ControllerState,
  newGameId: string
) => {
  if (!state.controllerProfiles) {
    // controllerProfiles don't exist yet, create it
    state.controllerProfiles = {};
  }
  if (
    // only initialize profile if perGameProfiles are enabled
    (!state.controllerProfiles[newGameId] && state.perGameProfilesEnabled) ||
    // always initialize default
    newGameId === "default"
  ) {
    const defaultProfile = get(
      state,
      "controllerProfiles.default",
      DEFAULT_CONTROLLER_PROFILE
    ) as ControllerProfile;

    state.controllerProfiles[newGameId] = defaultProfile;
  }
};

export const controllerSlice = createSlice({
  name: "controller",
  initialState,
  reducers: {
    setPerGameProfilesEnabled: (state, action: PayloadAction<boolean>) => {
      const enabled = action.payload;
      state.perGameProfilesEnabled = enabled;
      if (enabled) {
        bootstrapControllerProfile(state, extractCurrentGameId());
      }
    },
    setControllerMode: (
      state,
      action: PayloadAction<{ mode: ControllerModes }>
    ) => {
      const { mode } = action.payload;
      setStateValue({
        sliceState: state,
        key: "mode",
        value: mode,
      });
    },
    updateControllerProfiles: (
      state,
      action: PayloadAction<ControllerProfiles>
    ) => {
      merge(state.controllerProfiles, action.payload);
    },
    setEnabled: (
      state,
      action: PayloadAction<{
        enabled: boolean;
      }>
    ) => {
      const { enabled } = action.payload;

      setStateValue({
        sliceState: state,
        key: "enabled",
        value: enabled,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const controllerProfiles = action.payload
        .controllerProfiles as ControllerProfiles;
      const perGameProfilesEnabled = Boolean(
        action.payload.PerGameProfilesEnabled
      );

      state.controllerProfiles = controllerProfiles;
      state.perGameProfilesEnabled = perGameProfilesEnabled;
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const newGameId = action.payload as string;
      bootstrapControllerProfile(state, newGameId);
    });
  },
});

// -------------
// selectors
// -------------

export const selectControllerInfo = (state: RootState) => {
  const currentGameId = extractCurrentGameId();
  let controllerInfo;
  if (state.controller.perGameProfilesEnabled) {
    controllerInfo = state.controller.controllerProfiles[currentGameId];
  } else {
    controllerInfo = state.controller.controllerProfiles["default"];
  }

  return controllerInfo;
};

export const selectControllerMode = (state: RootState) => {
  const currentGameId = extractCurrentGameId();
  let controllerMode;
  if (state.controller.perGameProfilesEnabled) {
    controllerMode = state.controller.controllerProfiles[currentGameId].mode;
  } else {
    controllerMode = state.controller.controllerProfiles["default"].mode;
  }

  return controllerMode;
};

export const selectPerGameProfilesEnabled = (state: RootState) => {
  return state.controller.perGameProfilesEnabled;
};

export const selectControllerProfileDisplayName = (state: RootState) => {
  if (state.controller.perGameProfilesEnabled) {
    return Router.MainRunningApp?.display_name || "Default";
  } else {
    return "Default";
  }
};

// -------------
// Slice Util functions
// -------------

function setStateValue({
  sliceState,
  key,
  value,
}: {
  sliceState: ControllerState;
  key: string;
  value: any;
}) {
  if (sliceState.perGameProfilesEnabled) {
    const currentGameId = extractCurrentGameId();
    sliceState.controllerProfiles[currentGameId][key] = value;
  } else {
    sliceState.controllerProfiles["default"][key] = value;
  }
}
