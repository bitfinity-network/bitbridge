import { BottomSheet } from "react-spring-bottom-sheet";
import {
  As,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import "react-spring-bottom-sheet/dist/style.css";
import "./style.css";
import { IoClose } from "react-icons/io5";
import { IconType } from "react-icons/lib";

type ModalHeaderProps = {
  title?: string;
  onClose: () => void;
  disableClose?: boolean;
  iconPrefix?: IconType;
  onIconPrefixClick?: () => void;
};
type CustomModalProps = {
  isOpen: boolean;
  children: ReactNode;
  modalContentProps?: ModalContentProps;
  modalHeaderProps?: Pick<
    ModalHeaderProps,
    "title" | "disableClose" | "iconPrefix" | "onIconPrefixClick"
  >;
};

const ModalHeader = ({
  title,
  onClose,
  disableClose,
  iconPrefix,
  onIconPrefixClick,
}: ModalHeaderProps) => {
  const iconPrefixColor = useColorModeValue(
    "light.primary.main",
    "dark.primary.main"
  );
  const closeIconColor = useColorModeValue(
    disableClose ? "light.text.disabled" : "light.text.main",
    disableClose ? "dark.text.disabled" : "dark.text.main"
  );

  if (title) {
    return (
      <HStack justifyContent="space-between">
        {iconPrefix && (
          <Icon
            color={iconPrefixColor}
            h="28px"
            w="28px"
            onClick={onIconPrefixClick}
            cursor="pointer"
            size="48px"
            as={iconPrefix}
          />
        )}
        <Text color="brand.100" fontWeight={600} fontSize="20px">
          {title}
        </Text>
        <Icon
          color={closeIconColor}
          h="28px"
          w="28px"
          onClick={!disableClose ? onClose : undefined}
          cursor={disableClose ? "default" : "pointer"}
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
  onClose,
  children,
  modalContentProps,
  modalHeaderProps,
  ...rest
}: CustomModalProps & ModalProps) => {
  const breakpoint = useBreakpointValue({ base: "base", md: "md", lg: "lg" });
  const modalBgColor = useColorModeValue("light.bg.modal", "dark.bg.modal");

  const { title, disableClose, iconPrefix, onIconPrefixClick } =
    modalHeaderProps || {};

  if (breakpoint === "base") {
    return (
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        style={{ background: "none" }}
      >
        <Box bg="bg.300" p={6}>
          {title ? (
            <ModalHeader
              title={title}
              onClose={onClose}
              disableClose={disableClose}
            />
          ) : null}
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
        bg={modalBgColor}
        backdropFilter="blur(40px)"
        borderRadius={0}
        {...modalContentProps}
      >
        {title ? (
          <ModalHeader
            onClose={onClose}
            title={title}
            disableClose={disableClose}
            iconPrefix={iconPrefix}
            onIconPrefixClick={onIconPrefixClick}
          />
        ) : null}
        <ModalBody p={0}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { CustomModal };
