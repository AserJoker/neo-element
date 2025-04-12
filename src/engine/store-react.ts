import { useEffect, useMemo, useState } from "react";
import { createStore, IAction, IGetter, IStore } from "./store";

export const useStore = <
  S extends Record<string, unknown>,
  A extends IAction<S>,
  G extends IGetter<S>,
>(
  store?: IStore<S, A, G>
) => {
  const { ref, current, refGetter, ...instance } = createStore(store);

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
  const useGetter = <K extends keyof G>(key: K) => {
    const getter = useMemo(() => {
      return refGetter(key);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [state, setState] = useState(getter.value());
    useEffect(() => {
      let timer = 0;
      const currentDeps = [] as string[];
      const update = () => {
        const val = getter.value();
        const deps = getter
          .dependences()
          .filter((d) => !currentDeps.includes(d));

        if (deps.length) {
          if (currentDeps.length) {
            instance.unwatch(currentDeps.join(","), update);
          }
          currentDeps.push(...deps);
          instance.watch(currentDeps.join(","), update);
          update();
        } else {
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => setState(val));
        }
      };
      const deps = getter.dependences();
      if (deps.length) {
        instance.watch(deps.join(","), update);
      }
      return () => {
        const deps = getter.dependences();
        if (deps.length) {
          instance.unwatch(deps.join(","), update);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return state;
  };
  return { useField, useGetter, ...instance };
};
