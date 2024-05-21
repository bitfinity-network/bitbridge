import { Button, Flex } from "@chakra-ui/react";
import { CustomModal } from "../../ui";
import { useState } from "react";
import { WidgetForm } from "./WidgetForm";

export function Widget() {
  const [isModalOpen, setModalOpen] = useState(false);
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
          title: "Bridge Token",
          disableClose: isBridgingOrWalletOperation,
        }}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        blockScrollOnMount
        closeOnOverlayClick={false}
        modalContentProps={{
          width: "500px",
          borderRadius: "20px",
        }}
      >
        <WidgetForm
          setBridgingOrWalletOperation={setBridgingOrWalletOperation}
        />
      </CustomModal>
    </Flex>
  );
}
