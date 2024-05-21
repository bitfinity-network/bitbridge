import { Flex } from "@chakra-ui/react";
import { BridgeWidget } from "./components/BridgeWidget";

function App() {
  return (
    <>
      <Flex justifyContent="center" alignItems="center" h="90vh">
        <BridgeWidget
          defaultNetwork="IC"
          defaultAmount={1}
          onSuccess={(e) => console.log(e)}
        />
      </Flex>
    </>
  );
}

export default App;
