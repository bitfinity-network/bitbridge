import { Button, Flex } from '@chakra-ui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { Fragment, useState } from 'react';
import { CustomModal } from '../../ui';
import { IoWallet, IoSettings } from 'react-icons/io5';
import { useBridgeContext } from '../../provider/BridgeProvider';
import { WidgetNetworks } from './WidgetNetworks';

export function Widget() {
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
      </Flex>
      <WidgetWallets />
      <WidgetNetworks />
    </Fragment>
  );
}
