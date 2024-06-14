import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Button, HStack, Input, VStack, useToast } from '@chakra-ui/react';
import { EnhancedFormControl } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { fromFloating } from '../../utils';
import { TokenChip } from '../../ui/TokenChip/index.tsx';
import { MdOutlineArrowDownward } from 'react-icons/md';

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

  const hasBridges = bridges.length > 0;

  const [showTokenList, setShowTokenList] = useState(false);

  const [tokenId, setTokenId] = useState<string | undefined>(undefined);

  const [strAmount, setStrAmount] = useState('');

  const token = tokens.find(({ id }) => id === tokenId);

  const connectButtonTitle = hasBridges ? 'Bridge' : 'Connect Wallets';

  const connectButton = () => {
    if (isWalletConnectionPending || isBridgingInProgress) {
      return;
    }

    if (bridges.length > 0) {
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

      (async () => {
        await bridgeTo(token, floatingAmount);

        toast({
          title: 'Bridged successful',
          description: 'You received your tokens!',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
        setStrAmount('');
      })();
    } else {
      setWalletsOpen(true);
    }
  };

  const handleToggleTokenList = () => {
    setShowTokenList(!showTokenList);
  };

  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  useEffect(() => {
    if (setBridgingOrWalletOperation) {
      setBridgingOrWalletOperation(isPendingBridgeOrWalletOperation);
    }
  }, [isPendingBridgeOrWalletOperation, setBridgingOrWalletOperation]);

  return (
    <Box>
      <form>
        <EnhancedFormControl pt={4}>
          <HStack
            width="full"
            bg="secondary.main"
            padding={3}
            borderRadius="9px"
          >
            <Input
              placeholder="0.00"
              variant="unstyled"
              type="number"
              disabled={isPendingBridgeOrWalletOperation}
              value={strAmount}
              onChange={(e) => setStrAmount(e.target.value)}
              size="lg"
              height={hasBridges ? '70px' : 'initial'}
              fontSize={hasBridges ? '32px' : 'initial'}
            />
            {hasBridges ? (
              <VStack gap="4px">
                <TokenChip
                  bridge={bridges[0]}
                  target="from"
                  onClick={handleToggleTokenList}
                />
                <MdOutlineArrowDownward width="22px" height="22px" />
                <TokenChip
                  bridge={bridges[0]}
                  target="destination"
                  onClick={handleToggleTokenList}
                />
              </VStack>
            ) : (
              <Button variant="outline" onClick={handleToggleTokenList}>
                Select Token
              </Button>
            )}
          </HStack>
          {/* <LabelValuePair label="Service fee">0.00</LabelValuePair> */}
        </EnhancedFormControl>
        <Box width="full" pt={2}>
          <Button
            w="full"
            isLoading={isBridgingInProgress}
            disabled={isWalletConnectionPending}
            onClick={connectButton}
          >
            {connectButtonTitle}
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
