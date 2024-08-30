import { configureStore } from "@reduxjs/toolkit";
import { controllerSlice } from "./controllerSlice";
import { uiSlice } from "./uiSlice";
// import { logger } from "./logger";
import { saveControllerSettingsMiddleware } from "./controllerMiddleware";

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    controller: controllerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      saveControllerSettingsMiddleware,
      // logger
    ]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
