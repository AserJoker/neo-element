/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, defineComponent, IComponent, ISlot } from "./component";
import { IAction, IGetter } from "./store";
import { useStore } from "./store-react";
import { IValueType } from "./type";
import { get } from "./get";
import { useEffect, useMemo } from "react";

export interface INode {
  component?: string;
  children?: (INode | string)[];
  props?: Record<string, string>;
  on?: Record<string, string>;
  slot?: string;
  slotprops?: Record<string, string>;
  key?: string;
}
export interface IElementComponent<
  P = any,
  S extends Record<string, unknown> = any,
  A extends IAction<S> = any,
  G extends IGetter<S> = any,
  SS = any,
  E = any,
> extends IComponent<P, S, A, G, SS, E> {
  node: INode;
  states?: Record<string, string>;
  effects?: Record<string, string>;
}
const renderComponent = (
  state: Record<string, unknown>,
  node: INode,
  states: Record<string, string>,
  effects: Record<string, string>
) => {
  const customStates = Object.keys(states);
  const renderNode = (
    node: INode,
    ctx: { props: Record<string, unknown>; state: Record<string, unknown> },
    slots: Record<string, Function>
  ) => {
    const nodeProps: Record<string, unknown> = {};
    const on = node.on ?? {};
    const props = node.props ?? {};
    const vslots: Record<string, (INode | string)[]> = {};
    const children = node.children ?? [];
    children.forEach((c) => {
      if (typeof c === "string") {
        if (!vslots["default"]) {
          vslots["default"] = [];
        }
        vslots["default"].push(c);
      } else {
        const slot = c.slot ?? "default";
        if (!vslots[slot]) {
          vslots[slot] = [];
        }
        vslots[slot].push(c);
      }
    });
    Object.keys(props).forEach(
      (key) => (nodeProps[key] = get(ctx, props[key]))
    );
    const nodeSlots: Record<string, ISlot> = {};
    Object.keys(vslots).forEach((slot) => {
      nodeSlots[slot] = (props) => {
        const nodes = vslots[slot];
        return (
          <>
            {nodes.map((n) =>
              typeof n === "string"
                ? n
                : renderNode(
                    n,
                    {
                      ...ctx,
                      props: { ...props, ...ctx.props },
                    },
                    slots
                  )
            )}
          </>
        );
      };
    });
    const nodeOn: Record<string, Function> = {};
    Object.keys(on).forEach((event) => {
      const fn = get<Function>(ctx, on[event]);
      if (fn) {
        nodeOn[event] = fn;
      }
    });
    if (node.component === "slot") {
      return slots[node.slot ?? "default"]?.(nodeProps, nodeSlots);
    }
    return (
      <Component
        component={node.component}
        props={nodeProps}
        slots={nodeSlots}
        on={nodeOn}
        key={node.key}
      />
    );
  };
  return (
    store: ReturnType<typeof useStore<any, any, any>>,
    props: Record<string, unknown>,
    emit: Function,
    slots: Record<string, ISlot>
  ) => {
    const emits = useMemo(
      () =>
        new Proxy(
          {},
          {
            get:
              (_, event) =>
              (...args: any[]) =>
                emit(event, ...args),
          }
        ),
      [emit]
    );
    const actions = useMemo(
      () =>
        new Proxy(
          {},
          { get: (_, action) => store.useAction(action as string) }
        ),
      [store]
    );
    const context = {
      props,
      state: {} as Record<string, unknown>,
      emit: emits,
      action: actions,
    };
    Object.keys(states).forEach((name) => {
      context.state[name] = store.useField(name);
    });
    Object.keys(state).forEach((key) => {
      if (!customStates.includes(key)) {
        context.state[key] = store.useField(key);
      }
    });
    Object.keys(effects).forEach((ref) => {
      useEffect(() => {
        const callback = get<Function>(context, effects[ref]);
        if (callback) {
          callback(get(context, ref));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [get(context, ref)]);
    });
    return renderNode(node, context, slots);
  };
};
export const defineElementComponent = <
  P extends Record<string, IValueType>,
  S extends Record<string, unknown>,
  A extends IAction<S>,
  G extends IGetter<S>,
  SS extends Record<string, Record<string, IValueType>>,
  E extends Record<string, IValueType | undefined>,
>({
  node,
  effects = {},
  states = {},
  ...component
}: Omit<IElementComponent<P, S, A, G, SS, E>, "render">) => {
  return defineComponent({
    ...component,
    render: renderComponent(component.store.state ?? {}, node, states, effects),
  });
};
