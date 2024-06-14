import { Button, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { WidgetForm } from './WidgetForm';
import { WidgetWallets } from './WidgetWallets';
import { Fragment, useState } from 'react';
import { CustomModal } from '../../ui';
import { IoWallet, IoSettings, IoClose } from 'react-icons/io5';
import { useBridgeContext } from '../../provider/BridgeProvider';
import { WidgetNetworks } from './WidgetNetworks';

type WidgetProps = {
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
  const onIconPrefixClick = [handleToggleWallets, handleToggleNetworks];

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
              <HStack
                p={2}
                bg="secondary.alpha4"
                borderRadius="16px"
                gap="16px"
              >
                {[IoWallet, IoSettings].map((IconItem, index) => (
                  <Icon
                    key={index}
                    color="primary.main"
                    height="24px"
                    width="24px"
                    onClick={onIconPrefixClick?.[index]}
                    cursor="pointer"
                    size="48px"
                    as={IconItem}
                  />
                ))}
              </HStack>
              <Text color="brand.100" fontWeight={600} fontSize="20px">
                Bridge Token
              </Text>
              <Icon
                color="text.disabled"
                h="28px"
                w="28px"
                onClick={handleCloseModal}
                cursor="pointer"
                size="48px"
                as={IoClose}
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
