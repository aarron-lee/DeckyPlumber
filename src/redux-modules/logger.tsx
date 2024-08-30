import { logInfo } from "../backend/utils";

export const logger = (store: any) => (next: any) => async (action: any) => {
  await logInfo(
    `----------------before ${action.type} ${action.payload}-------------`
  );
  await logInfo(store.getState());
  await logInfo(`-----------------------`);

  const result = next(action);

  await logInfo(
    `----------------after ${action.type} ${action.payload}-------------`
  );
  await logInfo(store.getState());
  await logInfo(`-----------------------`);

  return result;
};

export default logger;
