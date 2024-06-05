import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  Collapse
} from '@chakra-ui/react';
import { LabelValuePair, EnhancedFormControl } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { BridgesListModal } from '../BridgesListModal';
import { useBridgeContext, Bridge } from '../../provider/BridgeProvider.tsx';
import { Token, useTokenContext } from '../../provider/TokensProvider.tsx';
import { TokenTag } from '../../ui/TokenTag';

type WidgetFormProps = {
  setBridgingOrWalletOperation?: Dispatch<SetStateAction<boolean>>;
};
export const WidgetForm = ({
  setBridgingOrWalletOperation
}: WidgetFormProps) => {
  const {
    setWalletsOpen,
    bridges,
    isBridgingInProgress,
    isWalletConnectionPending
  } = useBridgeContext();
  const { bridge: bridgeTo } = useTokenContext();

  const [showTokenList, setShowTokenList] = useState(false);
  const [showBridgesList, setShowBridgesList] = useState(false);

  const [token, setToken] = useState<Token | undefined>(undefined);
  const [bridge, setBridge] = useState<Bridge | undefined>(bridges[0]);

  const [amount, setAmount] = useState(0);

  const onAmountChange = (strAmount: string) => {
    const floatingAmount = parseFloat(strAmount);

    // TODO: Ensure decimals

    setAmount(floatingAmount);
  };

  const isPendingBridgeOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  const bridgingMessage = '';

  const connectButtonTitle = bridges.length > 0 ? 'Bridge' : 'Connect Wallets';

  const connectButton = () => {
    if (bridges.length > 0) {
      if (token) {
        bridgeTo(token, amount);
      }
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
        <EnhancedFormControl>
          <HStack justifyContent="space-between">
            <Box>
              <FormLabel color="secondary.white">Select Bridge</FormLabel>
            </Box>
          </HStack>
          <Box
            cursor="pointer"
            onClick={() => setShowBridgesList(!showBridgesList)}
          >
            {bridge ? bridge.name : 'Select bridge'}
          </Box>
        </EnhancedFormControl>
        <Box pt={2}>
          <Divider />
        </Box>
        <EnhancedFormControl pt={4}>
          <FormLabel>Assets</FormLabel>
          <Box
            cursor="pointer"
            onClick={() => setShowTokenList(!showTokenList)}
          >
            {token ? (
              <TokenTag
                name={token.name || token.symbol || ''}
                img={token?.logo || ''}
                variant="sm"
              />
            ) : (
              'Select token to bridge'
            )}
          </Box>
        </EnhancedFormControl>
        <EnhancedFormControl pt={4} bg="success">
          <FormLabel>Amount</FormLabel>
          <Input
            placeholder="0.00"
            variant="unstyled"
            type="number"
            value={amount > 0 ? amount : ''}
            onChange={(e) => onAmountChange(e.target.value)}
          />
          <LabelValuePair label="Service fee">0.00</LabelValuePair>
        </EnhancedFormControl>

        <Collapse in={false} animateOpacity>
          <VStack
            width="full"
            alignItems="center"
            justifyContent="center"
            // bg={enhancedFormControlBg}
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
        selectToken={setToken}
      />
      <BridgesListModal
        bridges={bridges}
        isOpen={showBridgesList}
        onClose={() => setShowBridgesList(false)}
        selectBridge={setBridge}
      />
    </Box>
  );
};
