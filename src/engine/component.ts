import { JSX, useCallback, useMemo } from "react";
import { IComputedType, IValueType } from "./type";
import { IAction, IStore } from "./store";
import { useStore } from "./store-react";

type IEmitParameters<E, K extends keyof E> = E[K] extends undefined
  ? []
  : [IComputedType<E[K]>];

export interface IComponent<
  P = any,
  S extends Record<string, unknown> = any,
  A extends IAction<S> = any,
  SS = any,
  E = any,
> {
  name: string;
  props?: P;
  store: IStore<S, A>;
  slots?: SS;
  emits?: E;
  render(
    store: ReturnType<typeof useStore<S, A>>,
    props: { [key in keyof P]: IComputedType<P[key]> },
    emit: <K extends keyof E>(key: K, ...args: IEmitParameters<E, K>) => void,
    slots?: {
      [key in keyof SS]: (
        props: { [kk in keyof SS[key]]: IComputedType<SS[key][kk]> },
        slots?: Record<string, Function>
      ) => JSX.Element | null | undefined;
    }
  ): JSX.Element | null | undefined;
}
const components: Record<string, IComponent> = {};
export const defineComponent = <
  P extends Record<string, IValueType>,
  S extends Record<string, unknown>,
  A extends IAction<S>,
  SS extends Record<string, Record<string, IValueType>>,
  E extends Record<string, IValueType | undefined>,
>(
  component: IComponent<P, S, A, SS, E>
) => {
  components[component.name] = component as IComponent;
  return component;
};

export interface ISlot {
  (props: any, slots?: Record<string, ISlot>): JSX.Element | null | undefined;
}

export interface IComponentElement {
  component?: IComponent<any, any, Record<string, any>>;
  props?: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
}
export const render = ({
  component,
  props = {},
  slots = {},
  on = {},
}: IComponentElement) => {
  if (!component) {
    return null;
  }
  const store = useMemo(() => useStore(component.store), [component]);
  const vslots = useMemo(() => {
    const vslots: Record<string, Function> = {};
    if (component.slots) {
      Object.keys(component.slots).forEach((key) => {
        vslots[key] = (
          props: Record<string, unknown>,
          s?: Record<string, ISlot>
        ) => slots?.[key]?.(props, s ?? {});
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
  component: string;
  props?: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
}> = ({ component, props = {}, slots = {}, on = {} }) =>
  render({ component: components[component], props, slots, on });
