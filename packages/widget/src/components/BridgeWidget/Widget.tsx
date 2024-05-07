import { Box } from "@chakra-ui/react";
import { useBridgeContext } from "../../provider/BridgeProvider";

export function Widget() {
  const { getEthWallet } = useBridgeContext();
  return (
    <Box onClick={() => getEthWallet()} bg="red">
      this is working
    </Box>
  );
}
