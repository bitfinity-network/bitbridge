import { Box, Divider, FormControl, FormLabel, HStack } from "@chakra-ui/react";
import { useBridgeContext } from "../../provider/BridgeProvider";
import { DropdownMenu } from "../../ui";
import { useState } from "react";
import { NETWORKS } from "../../utils";
import { NetworkProp } from "../../types";

export function Widget() {
  const [network, setNetwork] = useState(NETWORKS[0]);
  return (
    <Box width={"500px"} borderWidth={1}>
      <form>
        <FormControl>
          <HStack justifyContent="space-between">
            <Box>
              <FormLabel color="secondary.white">Select Network</FormLabel>
            </Box>
          </HStack>
          <DropdownMenu
            value={network}
            handleChange={(e) => setNetwork(e as NetworkProp)}
            list={[...NETWORKS]}
          />
        </FormControl>
        <Box pt={2}>
          <Divider />
        </Box>
      </form>
    </Box>
  );
}
