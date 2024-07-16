import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Image,
  Input,
  Spinner,
  Text,
  useToast
} from '@chakra-ui/react';
import { MdArrowForward, MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { EnhancedFormControl } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { fromFloating } from '../../utils';
import { TokenToChip, TokenFromChip } from '../../ui/TokenChip';

export const WidgetForm = () => {
  const toast = useToast();
  const { wallets, bridges, isWalletConnectionPending } = useBridgeContext();
  const {
    bridge: bridgeTo,
    isBridgingInProgress,
    nativeEthBalance,
    tokens,
    selectedToken
  } = useTokenContext();

  const [showTokenList, setShowTokenList] = useState(false);
  const [strAmount, setStrAmount] = useState('');

  const token = tokens.find(({ id }) => id === selectedToken);
  const hasBridges = bridges.length > 0;
  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  const handleToggleTokenList = useCallback(() => {
    setShowTokenList((prev) => !prev);
  }, []);

  const evmWallet = useMemo(
    () => wallets.find((wallet) => wallet.type === 'eth'),
    [wallets]
  );
  const icWallet = useMemo(
    () => wallets.find((wallet) => wallet.type === 'ic'),
    [wallets]
  );

  const handleButtonClick = useCallback(async () => {
    if (isPendingBridgeOrWalletOperation) {
      return;
    }

    if (!evmWallet) {
      return;
    }

    if (!evmWallet.connected) {
      evmWallet.toggle();
      return;
    }

    if (!token) {
      toast({
        title: 'No tokens selected',
        description: 'Please select a token to bridge',
        status: 'error',
        duration: 9000,
        isClosable: true
      });
      return;
    }

    if (hasBridges) {
      const floatingAmount = Number(strAmount);

      if (nativeEthBalance <= 0) {
        toast({
          title: "You don't have enough BFT balance",
          description: 'Please top up your balance',
          status: 'error',
          duration: 9000,
          isClosable: true
        });
        return;
      }

      if (token.balance <= fromFloating(floatingAmount, token.decimals)) {
        toast({
          title: "You don't have enough token balance",
          description: 'Please top up your balance',
          status: 'error',
          duration: 9000,
          isClosable: true
        });
        return;
      }

      if (floatingAmount <= 0) {
        toast({
          title: 'Insufficient bridge amount',
          description: 'Please select an amount to bridge',
          status: 'error',
          duration: 9000,
          isClosable: true
        });
        return;
      }

      await bridgeTo(token, floatingAmount);

      toast({
        title: 'Bridged successfully',
        description: 'You received your tokens!',
        status: 'success',
        duration: 9000,
        isClosable: true
      });

      setStrAmount('');
    } else {
      if (token.type === 'icrc' && !icWallet?.connected) {
        icWallet?.toggle();
      }
    }
  }, [
    isPendingBridgeOrWalletOperation,
    hasBridges,
    strAmount,
    nativeEthBalance,
    token,
    evmWallet,
    icWallet,
    bridgeTo,
    toast
  ]);

  const connectButton = useMemo(() => {
    const button = {
      isDisabled: isPendingBridgeOrWalletOperation,
      label: 'Bridge'
    };

    if (!evmWallet) {
      return button;
    }

    if (!evmWallet.connected) {
      button.label = 'Connect to Bitfinity';
    } else if (token) {
      if (token.type === 'icrc' && !icWallet?.connected) {
        button.label = 'Connect IC wallet';
      }
    }

    return button;
  }, [isPendingBridgeOrWalletOperation, evmWallet, icWallet, token]);

  return (
    <Box minW="auto">
      <form>
        <EnhancedFormControl>
          <HStack width="full" padding={4} borderRadius="9px">
            <Input
              placeholder="0.00"
              variant="unstyled"
              type="number"
              disabled={isPendingBridgeOrWalletOperation || !hasBridges}
              value={strAmount}
              onChange={(e) => setStrAmount(e.target.value)}
              size="lg"
              maxWidth="200px"
              bg="bg.module"
              height="36px"
              fontSize="24px"
            />
            {token ? (
              <HStack
                gap={4}
                flexShrink="0"
                bg="bg.main"
                paddingX="8px"
                paddingY="6px"
                borderRadius="8px"
                onClick={handleToggleTokenList}
                cursor="pointer"
                _hover={{ bg: 'misc.icon.hover' }}
              >
                <HStack gap={2}>
                  <Image
                    src={token.logo}
                    width="24px"
                    height="24px"
                    flexShrink="0"
                  />
                  <Text
                    maxW="50px"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                  >
                    {token.symbol}
                  </Text>
                </HStack>
                <Divider
                  orientation="vertical"
                  width="1.5px"
                  height="20px"
                  bg="bg.border"
                />
                <HStack
                  bg="bg.module"
                  paddingX="8px"
                  paddingY="4px"
                  borderRadius="6px"
                >
                  <TokenFromChip token={token} target="from" />
                  <Icon
                    as={MdArrowForward}
                    fontSize="16px"
                    color="primary.main"
                  />
                  <TokenToChip token={token} />
                </HStack>
              </HStack>
            ) : (
              <Button
                onClick={handleToggleTokenList}
                variant="outline"
                width="auto"
                size="sm"
                paddingX="12px"
                paddingY="8px"
                textTransform="none"
                rightIcon={
                  <Icon
                    as={MdOutlineKeyboardArrowDown}
                    fontSize="18px"
                    color="misc.icon.main"
                  />
                }
              >
                Select Token
              </Button>
            )}
          </HStack>
        </EnhancedFormControl>
        {isBridgingInProgress && (
          <HStack
            width="full"
            gap="8px"
            padding="12px"
            borderRadius="12px"
            bg="bg.module"
            marginBottom="8px"
          >
            <Spinner color="primary.main" size="sm" />
            <Text textStyle="body">Processing transaction...</Text>
          </HStack>
        )}
        <Box width="full" pt={2}>
          <Button
            w="full"
            isDisabled={connectButton.isDisabled}
            onClick={handleButtonClick}
            size="lg"
          >
            {connectButton.label}
          </Button>
        </Box>
      </form>
      <TokenListModal
        isOpen={showTokenList}
        onClose={() => setShowTokenList(false)}
      />
    </Box>
  );
};
