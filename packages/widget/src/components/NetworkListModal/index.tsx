import { NetworkProp } from "../../types";
import { CustomModal } from "../../ui";
import { TokenTag } from "../../ui/TokenTag";
import { Box, Flex } from "@chakra-ui/react";
import { NETWORKS } from "../../utils";

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectNetwork: (e: NetworkProp) => void;
};

export function NetworkListModal({
  isOpen,
  onClose,
  selectNetwork,
}: TokenListModelProps) {
  return (
    <CustomModal
      title="Select Asset"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <Box>
        <Box>
          <Flex gap={2} flexWrap="wrap">
            {NETWORKS.map((item) => {
              return (
                <Box
                  borderWidth={1}
                  borderColor="secondary.alpha12"
                  cursor="pointer"
                  py={2}
                  px={3}
                  key={item.name}
                  onClick={() => selectNetwork(item)}
                >
                  {item ? (
                    <TokenTag
                      name={item.symbol || item?.name || ""}
                      img={item?.logo || ""}
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
}
