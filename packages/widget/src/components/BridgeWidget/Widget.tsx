import { Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { IoWallet, IoSettings } from 'react-icons/io5';
import { Fragment, useState, useCallback } from 'react';

import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { CustomModal } from '../../ui';
import { useBridgeContext } from '../../provider/BridgeProvider';
import { WidgetNetworks } from './WidgetNetworks';

export type WidgetProps = {
  showWidgetModal: boolean;
};

export function Widget({ showWidgetModal }: WidgetProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { walletsOpen, setWalletsOpen, networksOpen, setNetworksOpen } =
    useBridgeContext();
  const [isBridgingOrWalletOperation, setBridgingOrWalletOperation] =
    useState(false);

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
                iconPrefix: [IoWallet, IoSettings],
                onIconPrefixClick: [handleToggleWallets, handleToggleNetworks]
              }}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              size="lg"
              blockScrollOnMount
              closeOnOverlayClick={false}
              modalContentProps={{
                width: '500px',
                height: 'auto',
                borderRadius: '20px',
                overflowY: 'hidden'
              }}
            >
              <WidgetForm
                setBridgingOrWalletOperation={setBridgingOrWalletOperation}
              />
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
                  as={IoWallet}
                />
                <Icon
                  height="24px"
                  width="24px"
                  onClick={handleToggleNetworks}
                  cursor="pointer"
                  size="48px"
                  as={IoSettings}
                />
              </HStack>
            </HStack>
            <WidgetForm
              setBridgingOrWalletOperation={setBridgingOrWalletOperation}
            />
          </VStack>
        )}
      </Flex>
      <WidgetWallets />
      <WidgetNetworks />
    </Fragment>
  );
}
