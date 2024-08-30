import { debounce } from "lodash";
import { setCurrentGameId, setInitialState } from "./extraActions";
import { extractCurrentGameId, getServerApi } from "../backend/utils";
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
  const serverApi = getServerApi();

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

  serverApi?.callPluginMethod("save_controller_settings", {
    payload,
  });
};
const debouncedSaveControllerSettings = debounce(saveControllerSettings, 300);

export const saveControllerSettingsMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const { type } = action;
    const serverApi = getServerApi();

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

      serverApi?.callPluginMethod("sync_controller_settings", {
        currentGameId,
      });
    }
    if (type === controllerSlice.actions.setPerGameProfilesEnabled.type) {
      serverApi?.callPluginMethod("save_per_game_profiles_enabled", {
        enabled: Boolean(action.payload),
      });
      if (action.payload) {
        serverApi?.callPluginMethod("sync_controller_settings", {
          currentGameId: extractCurrentGameId(),
        });
      } else {
        serverApi?.callPluginMethod("sync_controller_settings", {
          currentGameId: "default",
        });
      }
    }

    return result;
  };
