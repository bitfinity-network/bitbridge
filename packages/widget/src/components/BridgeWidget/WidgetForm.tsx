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

  const handleToggleTokenList = () => {
    setShowTokenList(!showTokenList);
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
