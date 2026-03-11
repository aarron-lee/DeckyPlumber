import { definePlugin, staticClasses, SidebarNavigation } from "@decky/ui";
import { routerHook } from "@decky/api";
import { FC, memo } from "react";
import ControllerPanel from "./components/controller/ControllerPanel";
import { getSettings } from "./backend/utils";
import { store } from "./redux-modules/store";
import { getInitialLoading } from "./redux-modules/uiSlice";
import { setInitialState } from "./redux-modules/extraActions";
import { Provider, useSelector } from "react-redux";
import { currentGameIdListener } from "./backend/currentGameIdListener";
import { IoGameController } from "react-icons/io5";
import ErrorBoundary from "./components/ErrorBoundary";
import OtaUpdates from "./components/OtaUpdates";
import MappingProfiles from "./components/controller/MappingProfiles";
import { suspendResumeListeners } from "./redux-modules/steamListeners";
import Options from "./components/controller/Options";
import ProfilesManagePage from "./pages/ProfilesManagePage";
import AboutPage from "./pages/AboutPage";
import { DECKY_PLUMBER_ROUTE } from "./consts";

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
      <ErrorBoundary title={"Mapping"}>
        <MappingProfiles />
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

const DeckyPlumberRouter: FC = () => {
  return (
    <Provider store={store}>
      <SidebarNavigation
        title="DeckyPlumber"
        showTitle
        pages={[
          {
            title: "Mapping Profiles",
            content: <ProfilesManagePage />,
            route: `${DECKY_PLUMBER_ROUTE}/profiles`,
          },
          {
            title: "About",
            content: <AboutPage />,
            route: `${DECKY_PLUMBER_ROUTE}/about`,
          },
        ]}
      />
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

  routerHook.addRoute(DECKY_PLUMBER_ROUTE, DeckyPlumberRouter);

  return {
    title: <div className={staticClasses.Title}>DeckyPlumber</div>,
    content: <AppContainer />,
    icon: <IoGameController />,
    onDismount() {
      clearListener();
      unsubscribeSuspendListeners();
      routerHook.removeRoute(DECKY_PLUMBER_ROUTE);
    },
  };
});
