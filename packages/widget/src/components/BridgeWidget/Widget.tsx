import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { useBridgeContext } from "../../provider/BridgeProvider";
import { DropdownMenu, LabelValuePair } from "../../ui";
import { useState } from "react";
import { NETWORKS, NETWORK_SYMBOLS } from "../../utils";
import { NetworkProp } from "../../types";
import { TokenListModal } from "../TokenListModal";
import { useTokens } from "../../hooks/useTokens";

export function Widget() {
  const [network, setNetwork] = useState(NETWORKS[0]);
  const tokens = useTokens(network.symbol);
  const [showTokenList, setShowTokenList] = useState(false);
  const [token, setToken] = useState({ name: "", symbol: "" });
  const [amount, setAmount] = useState(0);
  const getBalance = () => {
    if (network.symbol === NETWORK_SYMBOLS.ETHEREUM) {
      return 0;
    }
    return 0;
  };

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
        <FormControl pt={4}>
          <LabelValuePair
            textStyle={{
              fontSize: "md",
              fontWeight: "bold",
              color: "secondary.alpha60",
            }}
            label="Assets"
          >
            <FormLabel fontSize="sm">
              Your Balance:{" "}
              <Text as="span" color="primary.main">
                {getBalance() || 0}
              </Text>
            </FormLabel>
          </LabelValuePair>
          <Box
            cursor="pointer"
            onClick={() => setShowTokenList(!showTokenList)}
          >
            <DropdownMenu value={token} handleChange={(e) => setToken(e)} />
          </Box>
        </FormControl>
        <FormControl pt={4}>
          <FormLabel>Amount</FormLabel>
          <Input
            placeholder="0.00"
            variant="unstyled"
            type="number"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <LabelValuePair label="Service fee">0.000</LabelValuePair>
        </FormControl>
      </form>
      <TokenListModal
        tokens={tokens}
        tokenNetwork={network.symbol}
        isOpen={showTokenList}
        onClose={() => setShowTokenList(false)}
        selectToken={(e) => selectToken(e)}
      />
    </Box>
  );
}
