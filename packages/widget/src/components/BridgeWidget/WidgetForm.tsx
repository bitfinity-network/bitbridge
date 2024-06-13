import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Button, HStack, Input, VStack, useToast } from '@chakra-ui/react';
import { LabelValuePair, EnhancedFormControl, TokenChip } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { MdOutlineArrowDownward } from 'react-icons/md';
import { fromFloating } from '../../utils/format.ts';

type WidgetFormProps = {
  setBridgingOrWalletOperation?: Dispatch<SetStateAction<boolean>>;
};
export const WidgetForm = ({
  setBridgingOrWalletOperation
}: WidgetFormProps) => {
  const toast = useToast();

  const { setWalletsOpen, bridges, isWalletConnectionPending } =
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

  const connectButtonTitle = bridges.length > 0 ? 'Bridge' : 'Connect Wallets';

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

  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;
  const hasBridges = bridges.length > 0;

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
                  onClick={() => setShowTokenList(true)}
                />
                <MdOutlineArrowDownward width="22px" height="22px" />
                <TokenChip
                  bridge={bridges[1]}
                  target="destination"
                  onClick={() => setShowTokenList(true)}
                />
              </VStack>
            ) : (
              <Button variant="outline" onClick={() => setShowTokenList(true)}>
                Select Tokens
              </Button>
            )}
          </HStack>
          <LabelValuePair label="Service fee">0.00</LabelValuePair>
        </EnhancedFormControl>

        {/* <Collapse in={false} animateOpacity>
          <VStack
            width="full"
            alignItems="center"
            justifyContent="center"
            bg="secondary.main"
            borderRadius="12px"
            padding={4}
            marginY={4}
          >
            <Text textStyle="h6" color="secondary.alpha72">
              {bridgingMessage}
            </Text>
          </VStack>
        </Collapse> */}

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
