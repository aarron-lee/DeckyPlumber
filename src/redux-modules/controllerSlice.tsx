import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { get, merge, set } from "lodash";
import type { RootState } from "./store";
import { setCurrentGameId, setInitialState } from "./extraActions";
import { extractCurrentGameId } from "../backend/utils";
import { Router } from "@decky/ui";
import { AdvancedOptionsEnum, ControllerModes } from "../backend/constants";

export type AdvancedOption = {
  name: string;
  type: string;
  defaultValue: any;
  currentValue: any;
  statePath: string;
  description?: string;
  disabled?: { [k: string]: any };
};

export type MappingProfileInfo = {
  id: string;
  name: string;
  description?: string;
  isPreset: boolean;
};

type ControllerProfile = {
  mode: ControllerModes;
  activeProfiles?: string[];
};

const DEFAULT_CONTROLLER_PROFILE = {
  mode: "default",
};

type ControllerProfiles = {
  [gameId: string]: ControllerProfile;
};

export type CurrentProfileInfo = {
  path: string;
  name: string;
};

type ControllerState = {
  controllerProfiles: ControllerProfiles;
  perGameProfilesEnabled: boolean;
  advancedOptions: AdvancedOption[];
  advanced: { [optionName: string]: any };
  mappingProfiles: MappingProfileInfo[];
  mergeBaseProfile: boolean;
  currentProfileInfo: CurrentProfileInfo;
};

const initialState: ControllerState = {
  controllerProfiles: {},
  perGameProfilesEnabled: false,
  advanced: {},
  advancedOptions: [],
  mappingProfiles: [],
  mergeBaseProfile: true,
  currentProfileInfo: { path: "", name: "" },
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
    toggleMappingProfile: (
      state,
      action: PayloadAction<{ profileId: string; enabled: boolean }>
    ) => {
      const { profileId, enabled } = action.payload;
      const currentGameId = extractCurrentGameId();
      const key = state.perGameProfilesEnabled ? currentGameId : "default";
      const profile = state.controllerProfiles[key];

      if (!profile) return;

      if (!profile.activeProfiles) {
        profile.activeProfiles = [];
      }
      if (enabled) {
        if (!profile.activeProfiles.includes(profileId)) {
          profile.activeProfiles.push(profileId);
        }
      } else {
        profile.activeProfiles = profile.activeProfiles.filter(
          (id) => id !== profileId
        );
      }
    },
    updateAdvancedOption: (
      state,
      action: PayloadAction<{ statePath: string; value: any }>
    ) => {
      const { statePath, value } = action.payload;

      set(state, `advanced.${statePath}`, value);
    },
    setMappingProfiles: (
      state,
      action: PayloadAction<MappingProfileInfo[]>
    ) => {
      state.mappingProfiles = action.payload;
    },
    setMergeBaseProfile: (state, action: PayloadAction<boolean>) => {
      state.mergeBaseProfile = action.payload;
    },
    setCurrentProfileInfo: (state, action: PayloadAction<CurrentProfileInfo>) => {
      state.currentProfileInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setInitialState, (state, action) => {
      const controllerProfiles = action.payload
        .controllerProfiles as ControllerProfiles;
      const perGameProfilesEnabled = Boolean(
        action.payload.perGameProfilesEnabled
      );
      const { advancedOptions, mappingProfiles, currentProfileInfo, mergeBaseProfile } = action.payload;

      if (advancedOptions) {
        state.advancedOptions = advancedOptions;
        advancedOptions.forEach((option: AdvancedOption) => {
          set(state, `advanced.${option.statePath}`, option.currentValue);
        });
      }
      if (mappingProfiles) {
        state.mappingProfiles = mappingProfiles;
      }
      if (currentProfileInfo) {
        state.currentProfileInfo = currentProfileInfo;
      }
      if (mergeBaseProfile !== undefined) {
        state.mergeBaseProfile = mergeBaseProfile;
      }
      state.controllerProfiles = controllerProfiles;
      state.perGameProfilesEnabled = perGameProfilesEnabled;
    });
    builder.addCase(setCurrentGameId, (state, action) => {
      /*
        currentGameIdChanged, check if exists in redux store.
        if not exists, bootstrap it on frontend
      */
      const newGameId = action.payload as string;

      const useDefaultForNewProfiles = get(
        state,
        `advanced.${AdvancedOptionsEnum.ALWAYS_USE_DEFAULT}`,
        false
      );

      if (
        useDefaultForNewProfiles &&
        !state.controllerProfiles[newGameId] &&
        newGameId !== "default" &&
        state.perGameProfilesEnabled
      ) {
        // should use default profile
        state.controllerProfiles[newGameId] = {
          ...DEFAULT_CONTROLLER_PROFILE,
        } as ControllerProfile;
      } else {
        bootstrapControllerProfile(state, newGameId);
      }
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

export const selectAdvancedOptionsInfo = (state: RootState) => {
  const { advanced, advancedOptions } = state.controller;

  return { advancedState: advanced, advancedOptions };
};

export const selectAlwaysDefaultOption = (state: RootState) => {
  const { advancedState } = selectAdvancedOptionsInfo(state);
  const defaultOption = Boolean(
    advancedState[AdvancedOptionsEnum.ALWAYS_USE_DEFAULT]
  );
  return defaultOption;
};

export const selectMappingProfiles = (state: RootState): MappingProfileInfo[] =>
  state.controller.mappingProfiles;

export const selectActiveProfiles = (state: RootState): string[] => {
  const currentGameId = extractCurrentGameId();
  const key = state.controller.perGameProfilesEnabled
    ? currentGameId
    : "default";
  return state.controller.controllerProfiles[key]?.activeProfiles || [];
};

export const selectMergeBaseProfile = (state: RootState): boolean =>
  state.controller.mergeBaseProfile;

export const selectCurrentProfileInfo = (state: RootState): CurrentProfileInfo =>
  state.controller.currentProfileInfo;

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
