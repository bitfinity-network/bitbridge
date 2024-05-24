import { Button, Flex, useColorMode, useTheme } from "@chakra-ui/react";
import { CustomModal } from "../../ui";
import { useEffect, useState } from "react";
import { WidgetForm } from "./WidgetForm";
import { IoWallet } from "react-icons/io5";
import { WidgetWallets } from "./WidgetWallets";

export function Widget() {
  const { colorMode, setColorMode } = useColorMode();
  const theme = useTheme();
  const initialColorMode = theme?.config?.initialColorMode;

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

  useEffect(() => {
    if (colorMode !== initialColorMode) {
      setColorMode(initialColorMode);
    }
  }, [colorMode, initialColorMode, setColorMode]);

  return (
    <Flex justifyContent="center" alignItems="center" h="90vh">
      <Button onClick={handleOpenModal}>Bridge Now</Button>
      <CustomModal
        modalHeaderProps={{
          title: "Bridge Token",
          disableClose: isBridgingOrWalletOperation,
          iconPrefix: IoWallet,
          onIconPrefixClick: handleToggleWalletPannel,
        }}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        blockScrollOnMount
        closeOnOverlayClick={false}
        modalContentProps={{
          width: "500px",
          borderRadius: "20px",
          overflowY: "hidden",
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
