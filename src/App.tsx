import { useEffect, useState } from "react";
import "./App.css";
import { Component, defineComponent } from "./engine/component";
import { defineElementComponent } from "./engine/element";

defineComponent({
  name: "Counter",
  props: {},
  store: {
    state: {
      count: 0,
      data: 0,
    },
    getter: {
      nextCount(ctx) {
        if (ctx.state.count % 2 === 0) {
          return ctx.state.count + 1;
        } else {
          return ctx.state.data;
        }
      },
    },
    action: {
      addCount(ctx) {
        ctx.state.count++;
      },
      addData(ctx) {
        ctx.state.data = 100;
      },
    },
  },
  slots: { text: { value: { type: "number", optional: true } } },
  emits: { change: { type: "number" } },
  render(store, _props, emit, slots) {
    // const count = store.useField<number>("count");
    const count = store.useGetter("nextCount");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      emit("change", count);
    }, [count, emit]);
    return (
      <>
        <button onClick={store.useAction("addCount")}>
          {slots?.text({ value: count })}
        </button>
        <button onClick={store.useAction("addData")}>add data</button>
      </>
    );
  },
});
defineComponent({
  name: "Text",
  props: {
    data: {
      type: "number",
      optional: true,
    },
  },
  store: { state: {}, action: {} },
  slots: { default: {} },
  render(_store, props) {
    return `${props.data}`;
  },
});
defineElementComponent({
  name: "Demo",
  store: {
    state: { c: 0 },
    action: {
      change(_, count: number) {
        _.state.c = count;
      },
    },
  },
  props: {
    value: {
      type: "string",
    },
  },
  emits: { count: { type: "number" } },
  slots: { default: {} },
  effects: { "state.c": "emit.count" },
  node: {
    component: "div",
    children: [
      {
        component: "Counter",
        on: { change: "action.change" },
        children: [
          {
            component: "Text",
            slot: "text",
            props: { data: "slot.value" },
            key: "counter.text",
          },
        ],
        key: "counter",
      },
      {
        component: "Text",
        props: { data: "state.c" },
        key: "text",
      },
    ],
  },
});

function App() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible && (
        <Component
          component={"Demo"}
          on={{
            count: (value: number) => {
              console.log(value);
            },
          }}
        />
      )}
      <button
        onClick={() => {
          setVisible(!visible);
        }}
      >{`${visible}`}</button>
    </>
  );
}

export default App;
