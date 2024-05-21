import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { DropdownMenu, LabelValuePair } from "../../ui";
import { useState } from "react";
import { NETWORKS, NETWORK_SYMBOLS } from "../../utils";
import { NetworkProp, TokenProp } from "../../types";
import { TokenListModal } from "../TokenListModal";
import {
  useErc20TokenBalance,
  useIcTokenBalance,
  useTokens,
} from "../../hooks/useTokens";
import { NetworkListModal } from "../NetworkListModal";
import { useBridge } from "../../hooks/useBridge";
import { useWallets } from "../../hooks/useWallets";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useBridgeContext } from "../../provider/BridgeProvider";

export function Widget() {
  const { defaultNetwork } = useBridgeContext();
  const selectedDefaultNetwork =
    NETWORKS.find(
      (item) => item.symbol.toLowerCase() === defaultNetwork?.toLowerCase()
    ) || NETWORKS[0];
  const [network, setNetwork] = useState(selectedDefaultNetwork);
  const { bridgeFn, amount, setAmount, token, setToken } = useBridge({
    network: network?.symbol,
  });
  const tokens = useTokens(network.symbol);
  const [showTokenList, setShowTokenList] = useState(false);
  const [showNetworkList, setShowNetworkList] = useState(false);
  const { balance: ethBalance } = useErc20TokenBalance(
    token?.address as `0x${string}`
  );
  const { balance: icBalance } = useIcTokenBalance(token);
  const { connectToIcWallet } = useWallets();
  const { openConnectModal } = useConnectModal();
  const getBalance = () => {
    if (network.symbol === NETWORK_SYMBOLS.ETHEREUM) {
      return ethBalance;
    } else if (network.symbol === NETWORK_SYMBOLS.IC) {
      return icBalance;
    }
    return 0;
  };

  const selectToken = (e: TokenProp) => {
    setToken(e);
    setShowTokenList(false);
  };

  const selectNetwork = (e: NetworkProp) => {
    setNetwork(e);
    setShowNetworkList(false);
  };

  const bridgeToken = async () => {
    if (
      network.symbol === NETWORK_SYMBOLS.BITFINITY ||
      network.symbol === NETWORK_SYMBOLS.IC
    ) {
      if (openConnectModal) {
        await openConnectModal();
      }
      await connectToIcWallet();
    }
    await bridgeFn();
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
          <Box
            cursor="pointer"
            onClick={() => setShowNetworkList(!showNetworkList)}
          >
            <DropdownMenu
              value={network}
              handleChange={(e) => setNetwork(e as NetworkProp)}
            />
          </Box>
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
        <Box pt={2}>
          <Button w="full" onClick={() => bridgeToken()}>
            Bridge
          </Button>
        </Box>
      </form>
      <TokenListModal
        tokens={tokens}
        tokenNetwork={network.symbol}
        isOpen={showTokenList}
        onClose={() => setShowTokenList(false)}
        selectToken={(e) => selectToken(e)}
      />
      <NetworkListModal
        isOpen={showNetworkList}
        onClose={() => setShowNetworkList(false)}
        selectNetwork={(e) => selectNetwork(e)}
      />
    </Box>
  );
}
