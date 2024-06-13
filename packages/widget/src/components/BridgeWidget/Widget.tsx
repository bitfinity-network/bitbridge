import { Button, Flex } from '@chakra-ui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { useState } from 'react';
import { CustomModal } from '../../ui';
import { IoWallet } from 'react-icons/io5';

export function Widget() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [shouldOpenWalletPannel, setOpenWalletPannel] = useState(false);
  const [isBridgingOrWalletOperation, setBridgingOrWalletOperation] =
    useState(false);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleWalletPannelClose = () => {
    setOpenWalletPannel(false);
  };
  const handleToggleWalletPannel = () => {
    setOpenWalletPannel(!shouldOpenWalletPannel);
  };

  return (
    <Flex justifyContent="center" alignItems="center" h="90vh">
      <Button onClick={handleOpenModal}>Bridge Now</Button>
      <CustomModal
        modalHeaderProps={{
          title: 'Bridge Token',
          disableClose: isBridgingOrWalletOperation,
          iconPrefix: IoWallet,
          onIconPrefixClick: handleToggleWalletPannel
        }}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        blockScrollOnMount
        closeOnOverlayClick={false}
        modalContentProps={{
          width: '500px',
          height: shouldOpenWalletPannel ? '600px' : 'auto',
          borderRadius: '20px',
          overflowY: 'hidden'
        }}
      >
        <WidgetForm
          setBridgingOrWalletOperation={setBridgingOrWalletOperation}
        />
        <WidgetWallets
          isOpen={shouldOpenWalletPannel}
          onClose={handleWalletPannelClose}
        />
      </CustomModal>
    </Flex>
  );
}
