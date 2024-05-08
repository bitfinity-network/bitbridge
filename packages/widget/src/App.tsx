import { Box, Flex } from "@chakra-ui/react";
import { BridgeWidget } from "./components/BridgeWidget";

function App() {
  return (
    <>
      <Flex justifyContent="center" alignItems="center" h="90vh">
        <BridgeWidget />
      </Flex>
    </>
  );
}

export default App;
