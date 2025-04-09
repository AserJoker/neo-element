import { useEffect, useState } from "react";
import { createStore, IAction, IStore } from "./store";

export const useStore = <
  S extends Record<string, unknown>,
  A extends IAction<S>,
>(
  store?: IStore<S, A>
) => {
  const { ref, current, ...instance } = createStore(store);

  const useField = <T>(key: string) => {
    const [state, setState] = useState<T>(current(key));
    useEffect(() => {
      const { onMounted, onUnmounted } = ref<T>(key, (val) => setState(val));
      onMounted();
      return onUnmounted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return state as T;
  };
  return { useField, ...instance };
};
