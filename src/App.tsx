import "./App.css";
import { Box, Counter, IComponent, ISlot, render } from "./engine/component";

const components: Record<string, IComponent> = { Counter, Box };

const Component: React.FC<{
  component: string;
  props: Record<string, unknown>;
  slots?: Record<string, ISlot>;
  on?: Record<string, Function>;
}> = ({ component, props, slots, on }) => {
  return render({ component: components[component], props, slots, on });
};

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
