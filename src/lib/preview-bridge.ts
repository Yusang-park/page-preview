import { decodePreviewState } from "./state-codec";
import type { PreviewStateSnapshot } from "./types";

type ZustandStoreLike = {
  setState: (state: Record<string, unknown>) => unknown;
};

type ReduxStoreLike = {
  dispatch: (action: unknown) => unknown;
};

type ContextSetter = (value: unknown) => void;

type ReactQueryClientLike = {
  setQueryData: (queryKey: unknown[], data: unknown) => unknown;
};

export const createPreviewBridge = (options?: {
  queryKey?: string;
  developmentOnly?: boolean;
}) => {
  const queryKey = options?.queryKey ?? "__pp";
  const developmentOnly = options?.developmentOnly ?? true;

  const zustandStores = new Map<string, ZustandStoreLike>();
  const reduxStores = new Map<string, ReduxStoreLike>();
  const contextSetters = new Map<string, ContextSetter>();
  const queryClients = new Map<string, ReactQueryClientLike>();

  const registerZustandStore = (storeId: string, store: ZustandStoreLike) => {
    zustandStores.set(storeId, store);
  };

  const registerReduxStore = (storeId: string, store: ReduxStoreLike) => {
    reduxStores.set(storeId, store);
  };

  const registerContextSetter = (contextId: string, setter: ContextSetter) => {
    contextSetters.set(contextId, setter);
  };

  const registerReactQueryClient = (clientId: string, client: ReactQueryClientLike) => {
    queryClients.set(clientId, client);
  };

  const applySnapshot = (snapshot: PreviewStateSnapshot) => {
    snapshot.zustand?.forEach(({ storeId, state }) => {
      const store = zustandStores.get(storeId);
      if (!store) return;
      store.setState(state);
    });

    snapshot.redux?.forEach(({ storeId, action }) => {
      const store = reduxStores.get(storeId);
      if (!store) return;
      store.dispatch(action);
    });

    snapshot.context?.forEach(({ contextId, value }) => {
      const setter = contextSetters.get(contextId);
      if (!setter) return;
      setter(value);
    });

    snapshot.reactQuery?.forEach(({ queryKey, data }) => {
      queryClients.forEach((client) => {
        client.setQueryData(queryKey, data);
      });
    });
  };

  const applyFromSearch = (search: string) => {
    if (developmentOnly && process.env.NODE_ENV !== "development") return;
    const params = new URLSearchParams(search);
    const encoded = params.get(queryKey);
    if (!encoded) return;

    const snapshot = decodePreviewState(encoded);
    if (!snapshot) return;

    applySnapshot(snapshot);
  };

  const reset = () => {
    zustandStores.clear();
    reduxStores.clear();
    contextSetters.clear();
    queryClients.clear();
  };

  return {
    registerZustandStore,
    registerReduxStore,
    registerContextSetter,
    registerReactQueryClient,
    applySnapshot,
    applyFromSearch,
    reset,
  };
};
