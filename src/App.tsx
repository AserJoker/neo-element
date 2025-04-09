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
    useEffect(() => {
      emit("change", count);
    }, [count]);
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
  render(_store, props, _emit, _slots) {
    return `${props.data}`;
  },
});
defineElementComponent({
  name: "Demo",
  store: {
    state: {},
    action: {},
  },
  props: {
    value: {
      type: "string",
    },
  },
  slots: { default: {} },
  node: {
    component: "slot",
    children: [
      {
        component: "Text",
        props: { data: "props.value" },
      },
    ],
  },
});

defineElementComponent({
  name: "Box",
  store: { state: {}, action: {} },
  slots: { default: {} },
  node: {
    component: "div",
    children: ["hello world"],
  },
});

function App() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible && <Component component={"Box"} />}
      <button
        onClick={() => {
          setVisible(!visible);
        }}
      >{`${visible}`}</button>
    </>
  );
}

export default App;
