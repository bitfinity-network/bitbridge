import { BottomSheet } from "react-spring-bottom-sheet";
import {
  Box,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalContentProps,
  ModalOverlay,
  ModalProps,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import "react-spring-bottom-sheet/dist/style.css";
import "./style.css";
import { IoClose } from "react-icons/io5";

type CustomModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  modalContentProps?: ModalContentProps;
};

const ModalHeader = ({
  title,
  onClose,
}: {
  title?: string;
  onClose: () => void;
}) => {
  if (title) {
    return (
      <HStack justifyContent="space-between">
        <Text color="brand.100" fontWeight={600} fontSize="20px">
          {title}
        </Text>
        <Icon
          color="secondary.100"
          h="28px"
          w="28px"
          onClick={onClose}
          cursor="pointer"
          size="48px"
          as={IoClose}
        />
      </HStack>
    );
  }
  return null;
};

const CustomModal = ({
  isOpen,
  title,
  onClose,
  children,
  modalContentProps,
  ...rest
}: CustomModalProps & ModalProps) => {
  const breakpoint = useBreakpointValue({ base: "base", md: "md", lg: "lg" });

  if (breakpoint === "base") {
    return (
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        style={{ background: "none" }}
      >
        <Box bg="bg.300" p={6}>
          {title ? <ModalHeader title={title} onClose={onClose} /> : null}
          {children}
        </Box>
      </BottomSheet>
    );
  }
  return (
    <Modal size="sm" isOpen={isOpen} onClose={onClose} isCentered {...rest}>
      <ModalOverlay bg="" />
      <ModalContent
        boxShadow="0 20px 40px 0 rgba(0, 0, 0, 0.24)"
        p={4}
        bg="bg.modal"
        backdropFilter="blur(40px)"
        borderRadius={0}
        {...modalContentProps}
      >
        {title ? <ModalHeader onClose={onClose} title={title} /> : null}
        <ModalBody p={0}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { CustomModal };
