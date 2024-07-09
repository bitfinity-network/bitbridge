import { Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Fragment, useState, useCallback } from 'react';
import { LuSettings, LuWallet } from 'react-icons/lu';
import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { CustomModal } from '../../ui';
import { useBridgeContext } from '../../provider/BridgeProvider';
import { WidgetNetworks } from './WidgetNetworks';
import { useTokenContext } from '../../provider/TokensProvider.tsx';

export type WidgetProps = {
  showWidgetModal: boolean;
};

export function Widget({ showWidgetModal }: WidgetProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    walletsOpen,
    setWalletsOpen,
    networksOpen,
    setNetworksOpen,
    isWalletConnectionPending
  } = useBridgeContext();
  const { isBridgingInProgress } = useTokenContext();

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleToggleNetworks = useCallback(() => {
    setNetworksOpen(!networksOpen);
  }, [networksOpen, setNetworksOpen]);

  const handleToggleWallets = useCallback(() => {
    setWalletsOpen(!walletsOpen);
  }, [walletsOpen, setWalletsOpen]);

  const isBridgingOrWalletOperation =
    isBridgingInProgress || isWalletConnectionPending;

  return (
    <Fragment>
      <Flex justifyContent="center" alignItems="center" h="90vh">
        {showWidgetModal ? (
          <Fragment>
            <Button onClick={handleOpenModal}>Bridge Now</Button>
            <CustomModal
              modalHeaderProps={{
                title: 'Bridge Token',
                disableClose: isBridgingOrWalletOperation,
                iconSuffix: [LuWallet, LuSettings],
                onIconSuffixClick: [handleToggleWallets, handleToggleNetworks]
              }}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              size="lg"
              blockScrollOnMount
              closeOnOverlayClick={false}
              modalContentProps={{
                width: 'auto',
                height: 'auto',
                borderRadius: '20px',
                overflowY: 'hidden'
              }}
            >
              <WidgetForm />
            </CustomModal>
          </Fragment>
        ) : (
          <VStack
            justifyContent="center"
            alignItems="center"
            borderRadius="24px"
            border="2px solid"
            borderColor="bg.border"
            padding="20px"
          >
            <HStack width="full" justifyContent="space-between">
              <Text color="brand.100" fontWeight={600} fontSize="20px">
                Bridge Token
              </Text>
              <HStack gap="16px">
                <Icon
                  height="24px"
                  width="24px"
                  onClick={handleToggleWallets}
                  cursor="pointer"
                  size="48px"
                  as={LuWallet}
                  color="misc.icon.main"
                  _hover={{
                    color: 'misc.icon.hover'
                  }}
                />
                <Icon
                  height="24px"
                  width="24px"
                  onClick={handleToggleNetworks}
                  cursor="pointer"
                  size="48px"
                  as={LuSettings}
                  color="misc.icon.main"
                  _hover={{
                    color: 'misc.icon.hover'
                  }}
                />
              </HStack>
            </HStack>
            <WidgetForm />
          </VStack>
        )}
      </Flex>
      <WidgetWallets />
      <WidgetNetworks />
    </Fragment>
  );
}
