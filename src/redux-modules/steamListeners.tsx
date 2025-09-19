import { extractCurrentGameId, onResume, onSuspend } from "../backend/utils";

function suspendListener() {
  const onSuspendCallback = () => {
    const currentGameId = extractCurrentGameId();

    onSuspend(currentGameId);
  };
  try {
    const unregister =
      SteamClient.System.RegisterForOnSuspendRequest(
        onSuspendCallback,
      ).unregister;
    return unregister;
  } catch (e) {
    console.log(e);
  }

  // fallback to a different path for suspend if SteamClient.System option not available
  try {
    const unregisterOnSuspend =
      SteamClient.User.RegisterForPrepareForSystemSuspendProgress(
        onSuspendCallback,
      ).unregister;
    return unregisterOnSuspend;
  } catch (e) {
    console.error(e);
  }
}

function resumeListener() {
  const onResumeCallback = () => {
    const currentGameId = extractCurrentGameId();

    onResume(currentGameId);
  };
  try {
    const unregister =
      SteamClient.System.RegisterForOnResumeFromSuspend(
        onResumeCallback,
      ).unregister;
    return unregister;
  } catch (e) {
    console.log(e);
  }

  // fallback to a different path for resume if SteamClient.System option not available
  try {
    const unregisterOnResume =
      SteamClient.User.RegisterForResumeSuspendedGamesProgress(
        onResumeCallback,
      ).unregister;
    return unregisterOnResume;
  } catch (e) {
    console.error(e);
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
