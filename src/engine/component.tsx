/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createElement, ReactNode, useCallback, useMemo } from "react";
import { IComputedType, IValueType, Unpack } from "./type";
import { IAction, IGetter, IStore } from "./store";
import { useStore } from "./store-react";

type IEmitParameters<E, K extends keyof E> = E[K] extends undefined
  ? []
  : [IComputedType<E[K]>];

export type ISlots<SS> = {
  [key in keyof SS]: (
    props: Unpack<SS[key]>,
    slots?: Record<string, Function>
  ) => ReactNode;
};

export type IEmit<E> = <K extends keyof E>(
  key: K,
  ...args: IEmitParameters<E, K>
) => void;

export type IProp<P> = Unpack<P>;

export interface IComponent<
  P = any,
  S extends Record<string, unknown> = any,
  A extends IAction<S> = any,
  G extends IGetter<S> = any,
  SS = any,
  E = any,
> {
  name: string;
  props?: P;
  store: IStore<S, A, G>;
  slots?: SS;
  emits?: E;
  render(
    store: ReturnType<typeof useStore<S, A, G>>,
    props: IProp<P>,
    emit: IEmit<E>,
    slots: ISlots<SS>
  ): ReactNode;
}
const components: Record<string, IComponent> = {};
export const defineComponent = <
  P extends Record<string, IValueType>,
  S extends Record<string, unknown>,
  A extends IAction<S>,
  G extends IGetter<S>,
  SS extends Record<string, Record<string, IValueType>>,
  E extends Record<string, IValueType | undefined>,
>(
  component: IComponent<P, S, A, G, SS, E>
) => {
  components[component.name] = component as IComponent;
  return component;
};

export interface ISlot {
  (props: any, slots?: Record<string, ISlot>): ReactNode;
}

interface IComponentElement {
  component?: IComponent<any, any, Record<string, any>> | string;
  props?: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
  key: string;
}

type Remove<T, K extends keyof T> = {
  [key in keyof T as key extends K ? never : key]: T[key];
};

const renderComponent = ({
  component,
  props = {},
  slots = {},
  on = {},
}: Remove<IComponentElement, "key">) => {
  if (!component) {
    return null;
  }
  if (typeof component === "string") {
    return createElement(component, props, slots.default?.({}));
  }
  const store = useMemo(() => useStore(component.store), [component]);
  const vslots = useMemo(() => {
    const vslots: Record<string, Function> = {};
    if (component.slots) {
      Object.keys(component.slots).forEach((key) => {
        vslots[key] = (
          props: Record<string, unknown>,
          s: Record<string, ISlot> = {}
        ) => {
          return slots?.[key]?.(props, s ?? {});
        };
      });
    }
    return vslots;
  }, [slots, component]);
  const emit = useCallback(
    (event: string, payload?: any) => {
      on?.[event]?.(payload);
    },
    [on]
  );
  return component.render(store, props as any, emit as any, vslots as any);
};
export const Component: React.FC<{
  component?: string | IComponent;
  props?: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
}> = ({ component, props = {}, slots = {}, on = {} }) =>
  renderComponent({
    component:
      typeof component === "string"
        ? (components[component] ?? component)
        : component,
    props,
    slots,
    on,
  });
