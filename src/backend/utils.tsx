import { Router } from "@decky/ui";
import { callable, call } from "@decky/api";

export enum ServerAPIMethods {
  LOG_INFO = "log_info",
  GET_SETTINGS = "get_settings",
  ON_SUSPEND = "on_suspend",
  ON_RESUME = "on_resume",
  SAVE_CONTROLLER_SETTINGS = "save_controller_settings",
  SYNC_CONTROLLER_SETTINGS = "sync_controller_settings",
  SAVE_PER_GAME_PROFILES_ENABLED = "save_per_game_profiles_enabled",
  OTA_UPDATE = "ota_update",
}

export const onSuspend = (currentGameId: string) => {
  return call<[currentGameId: string], void>(
    ServerAPIMethods.ON_SUSPEND,
    currentGameId
  );
};

export const onResume = (currentGameId: string) => {
  return call<[currentGameId: string], void>(
    ServerAPIMethods.ON_RESUME,
    currentGameId
  );
};

export const logInfo = (info: any) => {
  call<[info: any], void>(ServerAPIMethods.LOG_INFO, info);
};

export const getSettings = callable<[], any>(ServerAPIMethods.GET_SETTINGS);

export const syncControllerSettings = (currentGameId: string) => {
  return call<[currentGameId: string], void>(
    ServerAPIMethods.SYNC_CONTROLLER_SETTINGS,
    currentGameId
  );
};

export const saveControllerSettings = (payload: any) => {
  return call<[payload: any], void>(
    ServerAPIMethods.SAVE_CONTROLLER_SETTINGS,
    payload
  );
};

export const savePerGameProfilesEnabled = (enabled: boolean) => {
  return call<[enabled: boolean], void>(
    ServerAPIMethods.SAVE_PER_GAME_PROFILES_ENABLED,
    enabled
  );
};

export const extractDisplayName = () =>
  `${Router.MainRunningApp?.display_name || "default"}`;

export const extractCurrentGameId = () =>
  `${Router.MainRunningApp?.appid || "default"}`;

export const getLatestVersionNum = async (serverApi: ServerAPI) => {
  const { result } = await serverApi.fetchNoCors(
    "https://raw.githubusercontent.com/aarron-lee/DeckyPlumber/main/package.json",
    { method: "GET" }
  );

  //@ts-ignore
  const body = result.body as string;
  if (body && typeof body === "string") {
    return JSON.parse(body)["version"];
  }
  return "";
};

export const otaUpdate = callable<[], any>(ServerAPIMethods.OTA_UPDATE);
