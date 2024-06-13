import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  VStack,
  Collapse
} from '@chakra-ui/react';
import { LabelValuePair, EnhancedFormControl, TokenChip } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { BridgesListModal } from '../BridgesListModal';
import { useBridgeContext, Bridge } from '../../provider/BridgeProvider.tsx';
import { Token, useTokenContext } from '../../provider/TokensProvider.tsx';
import { MdOutlineArrowDownward } from 'react-icons/md';

type WidgetFormProps = {
  setBridgingOrWalletOperation?: Dispatch<SetStateAction<boolean>>;
};
export const WidgetForm = ({
  setBridgingOrWalletOperation
}: WidgetFormProps) => {
  const {
    bridge: bridgeTo,
    isBridgingInProgress,
    nativeEthBalance,
    tokens
  } = useTokenContext();

  const [showTokenList, setShowTokenList] = useState(false);

  const [tokenId, setTokenId] = useState<string | undefined>(undefined);

  const [strAmount, setStrAmount] = useState('');

  const onAmountChange = (strAmount: string) => {
    const floatingAmount = parseFloat(strAmount);

    // TODO: Ensure decimals

    setAmount(floatingAmount);
  };

  const handleToggleTokenList = () => {
    setShowTokenList(!showTokenList);
  };

  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  const bridgingMessage = '';

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
              value={amount > 0 ? amount : ''}
              onChange={(e) => onAmountChange(e.target.value)}
              size="lg"
              height={bridge ? '70px' : 'initial'}
              fontSize={bridge ? '32px' : 'initial'}
            />
            {bridge ? (
              <VStack gap="4px">
                <TokenChip
                  bridge={bridge}
                  target="from"
                  onClick={handleToggleTokenList}
                />
                <MdOutlineArrowDownward width="22px" height="22px" />
                <TokenChip
                  bridge={bridge}
                  target="destination"
                  onClick={handleToggleTokenList}
                />
              </VStack>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowBridgesList(true)}
              >
                Select bridge
              </Button>
            )}
          </HStack>
          <LabelValuePair label="Service fee">0.00</LabelValuePair>
        </EnhancedFormControl>

        <Collapse in={false} animateOpacity>
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
        </Collapse>

        <Box width="full" pt={2}>
          <Button
            w="full"
            isLoading={isBridgingInProgress}
            disabled={isWalletConnectionPending || isBridgingInProgress}
            onClick={connectButton}
          >
            {connectButtonTitle}
          </Button>
        </Box>
        <Box pt={2}>
          <Button w="full" onClick={() => setWalletsOpen(true)}>
            Open wallets
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
