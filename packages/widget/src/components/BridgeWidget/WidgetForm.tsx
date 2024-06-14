import { useState } from 'react';
import { Box, Button, FormLabel, Input, useToast } from '@chakra-ui/react';

import { LabelValuePair, EnhancedFormControl } from '../../ui';
import { TokenListModal } from '../TokenListModal';
import { useBridgeContext } from '../../provider/BridgeProvider.tsx';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { TokenTag } from '../../ui/TokenTag';
import { fromFloating } from '../../utils';

export const WidgetForm = () => {
  const toast = useToast();

  const {
    bridges,
    isWalletConnectionPending,
    setWalletsOpen,
    setNetworksOpen
  } = useBridgeContext();
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

  return (
    <Box>
      <form>
        <EnhancedFormControl pt={4}>
          <FormLabel>Assets</FormLabel>
          <Box
            cursor="pointer"
            onClick={() => setShowTokenList(!showTokenList)}
          >
            {token ? (
              <TokenTag token={token} variant="sm" />
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
            disabled={isWalletConnectionPending || isBridgingInProgress}
            value={strAmount}
            onChange={(e) => setStrAmount(e.target.value)}
          />
          <LabelValuePair label="Service fee">0.00</LabelValuePair>
        </EnhancedFormControl>

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
        <Box pt={2}>
          <Button w="full" onClick={() => setNetworksOpen(true)}>
            Open networks
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
