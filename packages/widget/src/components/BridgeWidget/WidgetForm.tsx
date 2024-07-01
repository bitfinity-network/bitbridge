import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from 'react';
import { Box, Button, HStack, Input, useToast } from '@chakra-ui/react';
import { MdOutlineArrowRight } from 'react-icons/md';

import { EnhancedFormControl } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { fromFloating } from '../../utils';
import { TokenToChip, TokenFromChip } from '../../ui/TokenChip';

type WidgetFormProps = {
  setBridgingOrWalletOperation?: Dispatch<SetStateAction<boolean>>;
};

export const WidgetForm = ({
  setBridgingOrWalletOperation
}: WidgetFormProps) => {
  const toast = useToast();
  const { bridges, isWalletConnectionPending, setWalletsOpen } =
    useBridgeContext();
  const {
    bridge: bridgeTo,
    isBridgingInProgress,
    nativeEthBalance,
    tokens
  } = useTokenContext();

  const [showTokenList, setShowTokenList] = useState(false);
  const [tokenId, setTokenId] = useState<string | undefined>(undefined);
  const [strAmount, setStrAmount] = useState('');

  const token = tokens.find(({ id }) => id === tokenId);
  const hasBridges = bridges.length > 0;
  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  const handleToggleTokenList = useCallback(() => {
    setShowTokenList((prev) => !prev);
  }, []);

  const handleConnectButtonClick = useCallback(async () => {
    if (isPendingBridgeOrWalletOperation) return;

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
      setWalletsOpen(true);
    }
  }, [
    isPendingBridgeOrWalletOperation,
    hasBridges,
    strAmount,
    nativeEthBalance,
    token,
    bridgeTo,
    toast,
    setWalletsOpen
  ]);

  useEffect(() => {
    if (setBridgingOrWalletOperation) {
      setBridgingOrWalletOperation(isPendingBridgeOrWalletOperation);
    }
  }, [isPendingBridgeOrWalletOperation, setBridgingOrWalletOperation]);

  return (
    <Box minW={['300px', '450px']}>
      <form>
        <EnhancedFormControl pt={4}>
          <HStack width="full" padding={1} borderRadius="9px">
            <Input
              placeholder="0.00"
              variant="unstyled"
              type="number"
              disabled={isPendingBridgeOrWalletOperation || !hasBridges}
              value={strAmount}
              onChange={(e) => setStrAmount(e.target.value)}
              size="lg"
              height={hasBridges ? '70px' : 'initial'}
              fontSize={hasBridges ? '32px' : 'initial'}
            />
            {token ? (
              <HStack gap="4px" flexShrink="0">
                <TokenFromChip
                  token={token}
                  onClick={handleToggleTokenList}
                  target="from"
                />
                <MdOutlineArrowRight width="30px" height="30px" />
                <TokenToChip token={token} onClick={handleToggleTokenList} />
              </HStack>
            ) : (
              <Box
                onClick={handleToggleTokenList}
                borderRadius="8px"
                padding="8px"
                bg="bg.main"
                fontSize="12px"
                textTransform="none"
                width="auto"
                minWidth="100px"
                border="1px solid"
                borderColor="border.default"
                fontWeight="bold"
                cursor="pointer"
              >
                Select Token
              </Box>
            )}
          </HStack>
        </EnhancedFormControl>
        <Box width="full" pt={2}>
          <Button
            w="full"
            isLoading={isBridgingInProgress}
            disabled={isPendingBridgeOrWalletOperation || !hasBridges}
            onClick={handleConnectButtonClick}
          >
            {hasBridges ? 'Bridge' : 'Connect Wallets'}
          </Button>
        </Box>
      </form>
      <TokenListModal
        isOpen={showTokenList}
        onClose={() => setShowTokenList(false)}
        selectToken={setTokenId}
      />
    </Box>
  );
};
