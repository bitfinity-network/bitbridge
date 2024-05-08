import { useTokenSearch, useTokens } from "../../hooks/useTokens";
import { useWallets } from "../../hooks/useWallets";
import { TokenProp } from "../../types";
import { CustomModal, SearchInput } from "../../ui";
import { TokenTag } from "../../ui/TokenTag";
import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectToken: (e: TokenProp) => void;
  tokenNetwork: string;
  tokens: TokenProp[];
};

export function TokenListModal({
  isOpen,
  onClose,
  selectToken,
  tokenNetwork,
  tokens,
}: TokenListModelProps) {
  const { icWallet } = useWallets();
  const icWalletPrincipal = icWallet?.principal?.toText?.();

  const [search, setSearch] = useState("");
  const {
    data: filteredTokens,
    isLoading,
    isFetching,
  } = useTokenSearch({
    tokens,
    searchKey: search,
    network: tokenNetwork,
    userPrincipal: icWalletPrincipal,
  });
  return (
    <CustomModal
      title="Select Asset"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <Box>
        <Box py={4}>
          <SearchInput
            placeholder="Search asset"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
        <Box>
          <Flex gap={2} flexWrap="wrap">
            {filteredTokens?.length
              ? filteredTokens.map((item) => {
                  return (
                    <Box
                      borderWidth={1}
                      borderColor="secondary.alpha12"
                      cursor="pointer"
                      py={2}
                      px={3}
                      key={item.name}
                      onClick={() => selectToken(item)}
                    >
                      {item ? (
                        <TokenTag
                          name={item.symbol || item.name || ""}
                          img={item?.logo || ""}
                          variant="sm"
                        />
                      ) : null}
                    </Box>
                  );
                })
              : null}
          </Flex>
        </Box>
      </Box>
    </CustomModal>
  );
}
