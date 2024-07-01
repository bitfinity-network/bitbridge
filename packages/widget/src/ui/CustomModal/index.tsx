import { BottomSheet } from 'react-spring-bottom-sheet';
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
  useBreakpointValue
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import 'react-spring-bottom-sheet/dist/style.css';
import './style.css';
import { IoClose } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';

type ModalHeaderProps = {
  title?: string;
  onClose: () => void;
  disableClose?: boolean;
  iconPrefix?: IconType[];
  onIconPrefixClick?: (() => void)[];
  iconSuffix?: IconType[];
  onIconSuffixClick?: (() => void)[];
  showCloseIcon?: boolean;
};

type CustomModalProps = {
  isOpen: boolean;
  children: ReactNode;
  modalContentProps?: ModalContentProps;
  modalHeaderProps?: Pick<
    ModalHeaderProps,
    | 'title'
    | 'disableClose'
    | 'iconPrefix'
    | 'onIconPrefixClick'
    | 'iconSuffix'
    | 'onIconSuffixClick'
    | 'showCloseIcon'
  >;
};

const ModalHeader = ({
  title,
  onClose,
  disableClose = false,
  iconPrefix = [],
  onIconPrefixClick = [],
  iconSuffix = [],
  onIconSuffixClick = [],
  showCloseIcon = true
}: ModalHeaderProps) => {
  if (!title) return null;

  return (
    <HStack justifyContent="space-between">
      {iconPrefix.length > 0 && (
        <HStack p={2} gap="16px">
          {iconPrefix.map((IconItem, index) => (
            <Icon
              key={index}
              color="misc.icon.main"
              height="24px"
              width="24px"
              onClick={onIconPrefixClick[index]}
              cursor="pointer"
              size="48px"
              as={IconItem}
            />
          ))}
          {!showCloseIcon && (
            <Text color="brand.100" fontWeight={600} fontSize="20px">
              {title}
            </Text>
          )}
        </HStack>
      )}
      {showCloseIcon && (
        <Text color="brand.100" fontWeight={600} fontSize="20px">
          {title}
        </Text>
      )}

      <HStack gap="16px">
        <>
          {iconSuffix.length > 0 && (
            <HStack gap="16px">
              {iconSuffix.map((IconItem, index) => (
                <Icon
                  key={index}
                  color="misc.icon.main"
                  height="24px"
                  width="24px"
                  onClick={onIconSuffixClick[index]}
                  cursor="pointer"
                  size="48px"
                  as={IconItem}
                />
              ))}
            </HStack>
          )}
          {iconSuffix.length > 0 && (
            <Box
              height="24px"
              borderLeft="1.5px solid"
              borderColor="misc.icon.hover"
            />
          )}
          {showCloseIcon && (
            <Icon
              color="misc.icon.main"
              h="28px"
              w="28px"
              onClick={!disableClose ? onClose : undefined}
              cursor={disableClose ? 'default' : 'pointer'}
              size="48px"
              as={IoClose}
            />
          )}
        </>
      </HStack>
    </HStack>
  );
};

const CustomModal = ({
  isOpen,
  onClose,
  children,
  modalContentProps,
  modalHeaderProps: {
    title,
    disableClose = false,
    iconPrefix = [],
    onIconPrefixClick = [],
    iconSuffix = [],
    onIconSuffixClick = [],
    showCloseIcon
  } = {},
  ...rest
}: CustomModalProps & ModalProps) => {
  const breakpoint = useBreakpointValue({ base: 'base', md: 'md', lg: 'lg' });

  if (breakpoint === 'base') {
    return (
      <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        style={{ background: 'none' }}
      >
        <Box bg="bg.300" p={6}>
          {title && (
            <ModalHeader
              title={title}
              onClose={onClose}
              disableClose={disableClose}
              iconPrefix={iconPrefix}
              onIconPrefixClick={onIconPrefixClick}
              iconSuffix={iconSuffix}
              onIconSuffixClick={onIconSuffixClick}
              showCloseIcon={showCloseIcon}
            />
          )}
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
        bg="bg.main"
        backdropFilter="blur(40px)"
        borderRadius="8px"
        {...modalContentProps}
      >
        {title && (
          <ModalHeader
            onClose={onClose}
            title={title}
            disableClose={disableClose}
            iconPrefix={iconPrefix}
            onIconPrefixClick={onIconPrefixClick}
            iconSuffix={iconSuffix}
            onIconSuffixClick={onIconSuffixClick}
            showCloseIcon={showCloseIcon}
          />
        )}
        <ModalBody p={0}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { CustomModal };
