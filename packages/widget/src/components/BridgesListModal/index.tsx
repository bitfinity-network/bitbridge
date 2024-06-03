import { Box, Flex } from '@chakra-ui/react';

import { Bridge } from '../../provider/BridgeProvider.tsx';

import { CustomModal } from '../../ui';
import { TokenTag } from '../../ui/TokenTag';

type BridgesListModalProps = {
  bridges: Bridge[];
  isOpen: boolean;
  onClose: () => void;
  selectBridge: (bridge: Bridge) => void;
};

export const BridgesListModal = ({
  bridges,
  isOpen,
  onClose,
  selectBridge
}: BridgesListModalProps) => {
  return (
    <CustomModal
      modalHeaderProps={{ title: 'Select bridge' }}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <Box>
        <Box>
          <Flex gap={2} flexWrap="wrap">
            {bridges.map((bridge) => {
              return (
                <Box
                  borderWidth={1}
                  borderColor="secondary.alpha12"
                  cursor="pointer"
                  py={2}
                  px={3}
                  key={bridge.type}
                  onClick={() => {
                    onClose();
                    selectBridge(bridge);
                  }}
                >
                  {bridge ? (
                    <TokenTag
                      name={bridge.name}
                      img={bridge.logo}
                      variant="sm"
                    />
                  ) : null}
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>
    </CustomModal>
  );
};
