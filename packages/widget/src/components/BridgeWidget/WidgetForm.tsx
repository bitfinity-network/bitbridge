import {
  Box,
  Button,
  Divider,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { DropdownMenu, LabelValuePair, EnhancedFormControl } from "../../ui";
import { TokenListModal } from "../TokenListModal";
import { NetworkListModal } from "../NetworkListModal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { NETWORKS, NETWORK_SYMBOLS } from "../../utils";
import { useBridge } from "../../hooks/useBridge";
import {
  useErc20TokenBalance,
  useIcTokenBalance,
  useTokens,
} from "../../hooks/useTokens";
import { useWallets } from "../../hooks/useWallets";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NetworkProp, TokenProp } from "../../types";
import { useBridgeContext } from "../../provider/BridgeProvider";
import { useAccount } from "wagmi";

type WidgetFormProps = {
  setBridgingOrWalletOperation?: Dispatch<SetStateAction<boolean>>;
};
export const WidgetForm = ({
  setBridgingOrWalletOperation,
}: WidgetFormProps) => {
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { defaultNetwork } = useBridgeContext();
  const selectedDefaultNetwork =
    NETWORKS.find(
      (item) => item.symbol.toLowerCase() === defaultNetwork?.toLowerCase(),
    ) || NETWORKS[0];
  const [network, setNetwork] = useState(selectedDefaultNetwork);
  const {
    bridgeFn,
    amount,
    setAmount,
    token,
    setToken,
    isBridging,
    bridgingMesssage,
  } = useBridge({
    network: network?.symbol,
  });
  const tokens = useTokens(network.symbol);
  const [showTokenList, setShowTokenList] = useState(false);
  const [showNetworkList, setShowNetworkList] = useState(false);
  const { balance: ethBalance } = useErc20TokenBalance(
    token?.address as `0x${string}`,
  );
  const { balance: icBalance } = useIcTokenBalance(token);
  const {
    connectToIcWallet,
    isFetching: isFethcingICWallet,
    icWallet,
  } = useWallets();
  const { openConnectModal } = useConnectModal();
  const {
    isOpen: isBridgingMessageOpen,
    onOpen: onBridgingMessageOpen,
    onClose: onBridgingMessageClose,
  } = useDisclosure();

  const isPendingBridgeOrWalletOperation = isBridging || isFethcingICWallet;

  const isICOrEthWalletConnected =
    icWallet?.principal || (ethAddress && isEthConnected);

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

  const connectWallets = async () => {
    if (
      network.symbol === NETWORK_SYMBOLS.BITFINITY ||
      network.symbol === NETWORK_SYMBOLS.IC
    ) {
      if (openConnectModal) {
        await openConnectModal();
      }
      await connectToIcWallet();
    }
  };

  const bridgeToken = async () => {
    await bridgeFn();
  };

  useEffect(() => {
    if (setBridgingOrWalletOperation) {
      setBridgingOrWalletOperation(isPendingBridgeOrWalletOperation);
    }
  }, [isPendingBridgeOrWalletOperation, setBridgingOrWalletOperation]);

  useEffect(() => {
    if (bridgingMesssage && isBridging) {
      onBridgingMessageOpen();
    } else {
      onBridgingMessageClose();
    }
  }, [
    bridgingMesssage,
    onBridgingMessageOpen,
    onBridgingMessageClose,
    isBridging,
  ]);

  return (
    <Box>
      <form>
        <EnhancedFormControl>
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
        </EnhancedFormControl>
        <Box pt={2}>
          <Divider />
        </Box>
        <EnhancedFormControl pt={4}>
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
        </EnhancedFormControl>
        <EnhancedFormControl pt={4}>
          <FormLabel>Amount</FormLabel>
          <Input
            placeholder="0.00"
            variant="unstyled"
            type="number"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <LabelValuePair label="Service fee">0.000</LabelValuePair>
        </EnhancedFormControl>

        <Collapse in={isBridgingMessageOpen} animateOpacity>
          <VStack
            width="full"
            alignItems="center"
            justifyContent="center"
            bg={enhancedFormControlBg}
            borderRadius="12px"
            padding={4}
            marginY={4}
          >
            <Text textStyle="h6" color="secondary.alpha72">
              {bridgingMesssage}
            </Text>
          </VStack>
        </Collapse>

        <Box width="full" pt={2}>
          <Button
            isLoading={isPendingBridgeOrWalletOperation}
            w="full"
            onClick={isICOrEthWalletConnected ? bridgeToken : connectWallets}
          >
            {isICOrEthWalletConnected ? "Bridge" : "Connect Wallets"}
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
};