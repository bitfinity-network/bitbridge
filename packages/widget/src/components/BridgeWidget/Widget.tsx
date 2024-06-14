import { Button, Flex } from '@chakra-ui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { useState } from 'react';
import { CustomModal } from '../../ui';
import { IoWallet } from 'react-icons/io5';
import { useBridgeContext } from '../../provider/BridgeProvider';

export function Widget() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { walletsOpen, setWalletsOpen } = useBridgeContext();
  const [isBridgingOrWalletOperation, setBridgingOrWalletOperation] =
    useState(false);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  return (
    <Flex justifyContent="center" alignItems="center" h="90vh">
      <Button onClick={handleOpenModal}>Bridge Now</Button>
      <CustomModal
        modalHeaderProps={{
          title: 'Bridge Token',
          disableClose: isBridgingOrWalletOperation,
          iconPrefix: IoWallet,
          onIconPrefixClick: () => setWalletsOpen(!walletsOpen)
        }}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        blockScrollOnMount
        closeOnOverlayClick={false}
        modalContentProps={{
          width: '500px',
          height: walletsOpen ? '600px' : 'auto',
          borderRadius: '20px',
          overflowY: 'hidden'
        }}
      >
        <WidgetForm
          setBridgingOrWalletOperation={setBridgingOrWalletOperation}
        />
        <WidgetWallets />
      </CustomModal>
    </Flex>
  );
}
