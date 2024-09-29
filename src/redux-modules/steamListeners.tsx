import { extractCurrentGameId, ServerAPIMethods } from "../backend/utils";

function suspendListener() {
  const unregister = SteamClient.System.RegisterForOnSuspendRequest(() => {
    const currentGameId = extractCurrentGameId();

    serverApi?.callPluginMethod(ServerAPIMethods.ON_SUSPEND, { currentGameId });
  });
  return unregister;
}

function resumeListener() {
  const unregister = SteamClient.System.RegisterForOnResumeFromSuspend(() => {
    const currentGameId = extractCurrentGameId();

    serverApi?.callPluginMethod(ServerAPIMethods.ON_RESUME, { currentGameId });
  });
  return unregister;
}

export const suspendResumeListeners = () => {
  const s = suspendListener();
  const u = resumeListener();

  const unsubscribe = () => {
    if (typeof s === "function") {
      s();
    }
    if (typeof u === "function") {
      u();
    }
  };

  return unsubscribe;
};
