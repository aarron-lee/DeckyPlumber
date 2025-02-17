import { definePlugin, staticClasses } from "@decky/ui";
import { FC, memo } from "react";
import ControllerPanel from "./components/controller/ControllerPanel";
import { getSettings, logInfo } from "./backend/utils";
import { store } from "./redux-modules/store";
import { getInitialLoading } from "./redux-modules/uiSlice";
import { setInitialState } from "./redux-modules/extraActions";
import { Provider, useSelector } from "react-redux";
import { currentGameIdListener } from "./backend/currentGameIdListener";
import { IoGameController } from "react-icons/io5";
import ErrorBoundary from "./components/ErrorBoundary";
import OtaUpdates from "./components/OtaUpdates";
import { suspendResumeListeners } from "./redux-modules/steamListeners";
import Options from "./components/controller/Options";

const Content: FC = memo(() => {
  const loading = useSelector(getInitialLoading);
  if (loading) {
    return null;
  }
  return (
    <>
      <ErrorBoundary title={"Controller Mode"}>
        <ControllerPanel />
      </ErrorBoundary>
      <ErrorBoundary title={"Options"}>
        <Options />
      </ErrorBoundary>
      <ErrorBoundary>
        <OtaUpdates />
      </ErrorBoundary>
    </>
  );
});

const AppContainer: FC = () => {
  return (
    <Provider store={store}>
      <Content />
    </Provider>
  );
};

export default definePlugin(() => {
  getSettings().then((result) => {
    const results = result || {};

    store.dispatch(setInitialState(results));
  });

  const clearListener = currentGameIdListener();

  const unsubscribeSuspendListeners = suspendResumeListeners();

  return {
    title: <div className={staticClasses.Title}>DeckyPlumber</div>,
    content: <AppContainer />,
    icon: <IoGameController />,
    onDismount() {
      clearListener();
      unsubscribeSuspendListeners();
    },
  };
});
