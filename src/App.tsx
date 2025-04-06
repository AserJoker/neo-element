import { useState } from "react";
import "./App.css";
import { Component, defineComponent } from "./engine/component";

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
  slots: { default: {} },
  emits: { change: { type: "number" } },
  render(store, _props, _emit, slots) {
    const count = store.useField<number>("count");
    return (
      <button onClick={store.useAction("addCount")}>
        {slots?.default({}, { default: () => count })}
      </button>
    );
  },
});
defineComponent({
  name: "Box",
  props: {},
  store: { state: {}, action: {} },
  slots: { default: {} },
  render(_store, _props, _emit, slots) {
    return slots?.default({});
  },
});

function App() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible && (
        <Component
          component="Counter"
          props={{}}
          on={{}}
          slots={{
            default: (props, slots) => (
              <Component component="Box" on={{}} props={props} slots={slots} />
            ),
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
