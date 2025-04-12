/* eslint-disable @typescript-eslint/no-explicit-any */
import { clone } from "./clone";
import { get } from "./get";
import { reactive } from "./reactive";

interface IContext<S> {
  state: S;
}
export interface IAction<S> {
  [key: string]: (ctx: IContext<S>, ...args: any[]) => any;
}
export interface IGetter<S> {
  [key: string]: (ctx: IContext<S>) => any;
}
export interface IStore<
  S extends Record<string, unknown>,
  A extends IAction<S>,
  G extends IGetter<S>,
> {
  state?: S;
  action?: A;
  getter?: G;
}
type RemoveContext<F> = F extends (ctx: any, ...args: infer P) => any
  ? (...args: P) => ReturnType<F>
  : never;

type RemoveContextParameters<F> = F extends (ctx: any, ...args: infer P) => any
  ? P
  : never;

export const createStore = <
  S extends Record<string, unknown>,
  A extends IAction<S>,
  G extends IGetter<S>,
>(
  store: IStore<S, A, G> = {}
) => {
  const { state = {} as S, action = {} as A, getter = {} as G } = store;
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
    Object.keys(watchers).forEach((field) => {
      const items = field.split(",");
      const item = items.find((current) => {
        return (
          key === current ||
          key.startsWith(`${current}.`) ||
          current.startsWith(`${key}.`)
        );
      });
      if (item) {
        watchers[field].forEach((cb) => cb());
      }
    });
  };
  const raw = clone(state);
  const deps = [] as string[];
  const collection = (key: string) => {
    deps.push(key);
  };
  const instance = {
    raw,
    state: reactive(raw, effect, collection),
  };
  const reactiveActions = {} as { [key in keyof A]: RemoveContext<A[key]> };
  Object.keys(action).forEach(<K extends keyof A>(key: K) => {
    const fn = function (this: A, ...args: RemoveContextParameters<A[K]>) {
      return action[key].call(this, { state: instance.state }, ...args);
    } as RemoveContext<A[K]>;
    reactiveActions[key] = fn;
  });
  const ref = <T>(key: string, cb: (val: T) => void) => {
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
    instance.state = reactive(instance.raw, effect, collection);
  };
  const getterDependences = {} as Record<keyof G, string[]>;
  const refGetter = <K extends keyof G>(name: K) => {
    if (!getterDependences[name]) {
      getterDependences[name] = [];
    }
    const dependences = () => getterDependences[name];
    const value = (): ReturnType<G[K]> => {
      deps.length = 0;
      const result = getter[name]({
        get state() {
          return instance.state;
        },
      });
      deps.forEach((dep) => {
        if (!getterDependences[name].includes(dep)) {
          getterDependences[name].push(dep);
        }
      });
      return result;
    };
    return { dependences, value };
  };
  const current = <T>(key: string) => {
    return Reflect.get(instance.raw, key) as T;
  };
  return { ref, useAction, reset, watch, unwatch, current, refGetter };
};
