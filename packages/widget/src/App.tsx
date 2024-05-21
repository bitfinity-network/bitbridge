import { BridgeWidget } from "./components/BridgeWidget";

function App() {
  return <BridgeWidget successFn={(e) => console.log(e)} />;
}

export default App;
