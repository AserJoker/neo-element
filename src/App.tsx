import { useEffect, useState } from "react";
import "./App.css";
import { Component, defineComponent } from "./engine/component";
import { defineElementComponent } from "./engine/node";

defineComponent({
  name: "Counter",
  props: {},
  store: {
    state: {
      count: 0,
    },
    action: {
      addCount(ctx) {
        ctx.state.count++;
      },
    },
  },
  slots: { text: { value: { type: "number", optional: true } } },
  emits: { change: { type: "number" } },
  render(store, _props, emit, slots) {
    const count = store.useField<number>("count");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      emit("change", count);
    }, [count, emit]);
    return (
      <button onClick={store.useAction("addCount")}>
        {slots?.text({ value: count })}
      </button>
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
            props: { data: "props.value" },
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
