import { clone } from "./clone";
import { get } from "./get";
import { reactive } from "./reactive";

interface IContext<S> {
  state: S;
}
export interface IAction<S> {
  [key: string]: (ctx: IContext<S>, ...args: any[]) => any;
}
export interface IStore<
  S extends Record<string, unknown>,
  A extends IAction<S>
> {
  state?: S;
  action?: A;
}
type RemoveContext<F> = F extends (ctx: any, ...args: infer P) => any
  ? (...args: P) => ReturnType<F>
  : never;

type RemoveContextParameters<F> = F extends (ctx: any, ...args: infer P) => any
  ? P
  : never;

export const createStore = <
  S extends Record<string, unknown>,
  A extends IAction<S>
>(
  store: IStore<S, A> = {}
) => {
  const { state = {} as S, action = {} as A } = store;
  const watchers: Record<string, (() => void)[]> = {};
  const watch = (key: string, cb: () => void) => {
    if (!watchers[key]) {
      watchers[key] = [];
    }
    watchers[key].push(cb);
  };
  const unwatch = (key: string, cb: () => void) => {
    if (watchers[key]) {
      const index = watchers[key].indexOf(cb);
      if (index !== -1) {
        watchers[key].splice(index, 1);
      }
      if (watchers[key].length === 0) {
        delete watchers[key];
      }
    }
  };
  const effect = (key: string) => {
    Object.keys(watchers).forEach((current) => {
      if (
        key === current ||
        key.startsWith(`${current}.`) ||
        current.startsWith(`${key}.`)
      ) {
        watchers[current].forEach((cb) => cb());
      }
    });
  };
  const raw = clone(state);
  const instance = {
    raw,
    state: reactive(raw, effect),
    getState() {
      return this.state;
    },
  };
  const reactiveActions = {} as { [key in keyof A]: RemoveContext<A[key]> };
  Object.keys(action).forEach(<K extends keyof A>(key: K) => {
    const fn = function (this: A, ...args: RemoveContextParameters<A[K]>) {
      return action[key].call(this, { state: instance.state }, ...args);
    } as RemoveContext<A[K]>;
    reactiveActions[key] = fn;
  });
  const useRef = <T>(key: string, cb: (val: T) => void) => {
    const effect = () => cb(get(instance.raw, key) as T);
    effect();
    return {
      onMounted: () => watch(key, effect),
      onUnmounted: () => unwatch(key, effect),
      current: () => get(instance.raw, key),
    };
  };
  const useAction = <K extends keyof A>(name: K) => reactiveActions[name];
  const reset = () => {
    instance.raw = clone(state);
    instance.state = reactive(instance.raw, effect);
  };
  const current = <T>(key: string) => {
    return Reflect.get(instance.raw, key) as T;
  };
  return { useRef, useAction, reset, watch, unwatch, current };
};
