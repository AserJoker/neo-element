import {
  Component,
  defineComponent,
  IComponent,
  IEmit,
  ISlot,
} from "./component";
import { IAction } from "./store";
import { useStore } from "./store-react";
import { IValueType } from "./type";
import { get } from "./get";

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
  SS = any,
  E = any,
> extends IComponent<P, S, A, SS, E> {
  node: INode;
  states?: Record<string, string>;
}
const renderComponent = (node: INode, states: Record<string, string>) => {
  return (
    store: ReturnType<typeof useStore<any, any>>,
    props: Record<string, unknown>,
    emit: IEmit<any>,
    slots: Record<string, ISlot>
  ) => {
    const context = {
      props,
      state: {} as Record<string, unknown>,
      emit,
    };
    Object.keys(states).forEach((name) => {
      context.state[name] = store.useField(name);
    });
    const renderNode = (
      node: INode,
      ctx: typeof context,
      cslots: Record<string, ISlot>
    ) => {
      const nodeProps: Record<string, unknown> = {};
      const props = node.props ?? {};
      Object.keys(props).forEach(
        (key) => (nodeProps[key] = get(ctx, props[key]))
      );
      const nodeSlots: Record<string, ISlot> = {};
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
      Object.keys(vslots).forEach((slot) => {
        nodeSlots[slot] = (props, slots = {}) => {
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
      Object.keys(cslots).forEach((key) => {
        const current = nodeSlots[key];
        const mergeSlots = (vslots: Record<string, ISlot>) => {
          const result = { ...vslots };
          if (result[key]) {
            const old = result[key];
            result[key] = (props, slots = {}) => old(props, mergeSlots(slots));
          } else {
            result[key] = current;
          }
          return result;
        };
        nodeSlots[key] = (props, slots = {}) =>
          cslots[key](props, mergeSlots(slots));
      });
      if (node.component === "slot") {
        return slots[node.slot ?? "default"]?.(nodeProps, nodeSlots);
      }
      return (
        <Component
          component={node.component}
          props={nodeProps}
          slots={nodeSlots}
        />
      );
    };
    return renderNode(node, context, {});
  };
};
export const defineElementComponent = <
  P extends Record<string, IValueType>,
  S extends Record<string, unknown>,
  A extends IAction<S>,
  SS extends Record<string, Record<string, IValueType>>,
  E extends Record<string, IValueType | undefined>,
>({
  node,
  states = {},
  ...component
}: Omit<IElementComponent<P, S, A, SS, E>, "render">) => {
  return defineComponent({
    ...component,
    render: renderComponent(node, states),
  });
};
