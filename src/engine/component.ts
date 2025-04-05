import { createElement, JSX, useEffect } from "react";
import { IComputedType, IValueType } from "./type";
import { IAction } from "./store";
import { useStore } from "./store-react";

type IEmitParameters<E, K extends keyof E> = E[K] extends undefined
  ? []
  : [IComputedType<E[K]>];

export interface IComponent<
  P = any,
  S extends Record<string, unknown> = {},
  A extends IAction<S> = IAction<S>,
  SS = any,
  E = any
> {
  name: string;
  props?: P;
  store: ReturnType<typeof useStore<S, A>>;
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
      ) => JSX.Element | null;
    }
  ): JSX.Element | null;
}
export const defineComponent = <
  P extends Record<string, IValueType>,
  S extends Record<string, unknown>,
  A extends IAction<S>,
  SS extends Record<string, Record<string, IValueType>>,
  E extends Record<string, IValueType | undefined>
>(
  component: IComponent<P, S, A, SS, E>
) => component;

export interface ISlot {
  (props: any, slots?: Record<string, ISlot>): JSX.Element | null;
}

export interface IComponentElement {
  component: IComponent<any, any, Record<string, any>>;
  props: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
}
export const render = (element: IComponentElement) => {
  const slots: Record<string, Function> = {};
  if (element.component.slots) {
    Object.keys(element.component.slots).forEach((key) => {
      slots[key] = (
        props: Record<string, unknown>,
        slots?: Record<string, ISlot>
      ) => {
        return element.slots?.[key]?.(props, slots ?? {});
      };
    });
  }
  const emit = (event: string, payload?: any) => {
    element.on?.[event]?.(payload);
  };
  return element.component.render(
    element.component.store,
    element.props as any,
    emit as any,
    slots as any
  );
};

export const Counter = defineComponent({
  name: "counter",
  props: {},
  slots: {
    default: {},
  },
  store: useStore({
    state: { count: 0 },
    action: {
      addCount(ctx) {
        ctx.state.count++;
      },
    },
  }),
  emits: {
    change: { type: "number" },
  },
  render(store, _props, emit, slots) {
    const count = store.useField<number>("count");
    useEffect(() => {
      emit("change", count);
    }, [count]);
    return createElement(
      "button",
      { onClick: () => store.useAction("addCount")() },
      slots?.default({}, { default: () => count })
    );
  },
});
export const Box = defineComponent({
  name: "box",
  slots: {
    default: {},
  },
  store: useStore(),
  render(_store, _props, _emit, slots) {
    return slots?.default({}) ?? null;
  },
});
