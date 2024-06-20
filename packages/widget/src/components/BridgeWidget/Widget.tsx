import { Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { IoWallet, IoSettings } from 'react-icons/io5';

import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { Fragment, useState } from 'react';
import { CustomModal } from '../../ui';
import { useBridgeContext } from '../../provider/BridgeProvider';
import { WidgetNetworks } from './WidgetNetworks';

export type WidgetProps = {
  showWidgetModal: boolean;
};

export function Widget({ showWidgetModal }: WidgetProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const { walletsOpen, setWalletsOpen } = useBridgeContext();
  const [isBridgingOrWalletOperation, setBridgingOrWalletOperation] =
    useState(false);
  const { setNetworksOpen, networksOpen } = useBridgeContext();

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleToggleNetworks = () => {
    setNetworksOpen(!networksOpen);
  };
  const handleToggleWallets = () => {
    setWalletsOpen(!walletsOpen);
  };

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
          <VStack justifyContent="center" alignItems="center">
            <HStack width="full" justifyContent="space-between">
              <Icon
                color="primary.main"
                height="24px"
                width="24px"
                onClick={handleToggleWallets}
                cursor="pointer"
                size="48px"
                as={IoWallet}
              />
              <Text color="brand.100" fontWeight={600} fontSize="20px">
                Bridge Token
              </Text>
              <Icon
                color="primary.main"
                height="24px"
                width="24px"
                onClick={handleToggleNetworks}
                cursor="pointer"
                size="48px"
                as={IoSettings}
              />
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
