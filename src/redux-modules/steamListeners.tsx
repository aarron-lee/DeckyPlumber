import { extractCurrentGameId, onResume, onSuspend } from "../backend/utils";

function suspendListener() {
  try {
    const unregister = SteamClient.System.RegisterForOnSuspendRequest(() => {
      const currentGameId = extractCurrentGameId();

      onSuspend(currentGameId);
    });
    return unregister;
  } catch (e) {
    console.log(e)
  }
}

function resumeListener() {
  try {
    const unregister = SteamClient.System.RegisterForOnResumeFromSuspend(() => {
      const currentGameId = extractCurrentGameId();

      onResume(currentGameId);
    });
    return unregister;
  } catch (e) {
    console.log(e)
  }
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
