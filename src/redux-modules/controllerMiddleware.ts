import { debounce } from "lodash";
import { setCurrentGameId, setInitialState } from "./extraActions";
import {
  extractCurrentGameId,
  savePerGameProfilesEnabled,
  syncControllerSettings,
} from "../backend/utils";
import { controllerSlice } from "./controllerSlice";

// -------------
// middleware
// -------------

const mutatingActionTypes = [
  controllerSlice.actions.updateControllerProfiles.type,
  controllerSlice.actions.setPerGameProfilesEnabled.type,
  controllerSlice.actions.setControllerMode.type,
  setCurrentGameId.type,
];

// persist controller settings to the backend
const saveControllerSettings = (store: any) => {
  const {
    controller: { controllerProfiles, perGameProfilesEnabled },
  } = store.getState();
  const currentGameId = perGameProfilesEnabled
    ? extractCurrentGameId()
    : "default";

  const payload = {
    controllerProfiles,
    currentGameId,
  };

  saveControllerSettings(payload);
};
const debouncedSaveControllerSettings = debounce(saveControllerSettings, 300);

export const saveControllerSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;

    const result = next(action);

    if (mutatingActionTypes.includes(type)) {
      // save to backend
      debouncedSaveControllerSettings(store);
    }
    if (type === setInitialState.type || type === setCurrentGameId.type) {
      // tell backend to sync controller to current FE state
      const {
        controller: { perGameProfilesEnabled },
      } = store.getState();
      const currentGameId = perGameProfilesEnabled
        ? extractCurrentGameId()
        : "default";

      syncControllerSettings(currentGameId);
    }
    if (type === controllerSlice.actions.setPerGameProfilesEnabled.type) {
      savePerGameProfilesEnabled(Boolean(action.payload));
      if (action.payload) {
        syncControllerSettings(extractCurrentGameId());
      } else {
        syncControllerSettings("default");
      }
    }

    return result;
  };
