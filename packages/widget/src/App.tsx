import { BridgeWidget } from "./components/BridgeWidget";

function App() {
  return (
    <BridgeWidget
      defaultNetwork="IC"
      defaultAmount={1}
      onSuccess={(e) => console.log(e)}
    />
  );
}

export default App;
