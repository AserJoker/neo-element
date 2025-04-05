import { useEffect, useState } from "react";
import { createStore, IAction, IStore } from "./store";

export const useStore = <
  S extends Record<string, unknown>,
  A extends IAction<S>
>(
  store?: IStore<S, A>
) => {
  const { useRef, current, ...instance } = createStore(store);

  const useField = <T>(key: string) => {
    const [state, setState] = useState<T>(current(key));
    useEffect(() => {
      const { onMounted, onUnmounted } = useRef<T>(key, (val) => setState(val));
      onMounted();
      return onUnmounted;
    }, []);
    return state as T;
  };
  return { useField, ...instance };
};
