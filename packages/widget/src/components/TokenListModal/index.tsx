import { Box, Flex } from '@chakra-ui/react';
import { useState, useMemo } from 'react';

import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { CustomModal, SearchInput } from '../../ui';
import { TokenTag } from '../../ui/TokenTag';

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectToken: (tokenId: string) => void;
};

export function TokenListModal({
  isOpen,
  onClose,
  selectToken
}: TokenListModelProps) {
  const { tokens } = useTokenContext();

  const [search, setSearch] = useState<string>('');

  const filteredTokens = useMemo(() => {
    if (!search.length) return tokens;

    const needle = search.trim().toLowerCase();

    return tokens.filter(({ name, symbol }) => {
      const searchable = [name, symbol].map((str) => str.trim().toLowerCase());
      return searchable.some((haystack) => haystack.includes(needle));
    });
  }, [search, tokens]);

  return (
    <CustomModal
      modalHeaderProps={{ title: 'Select Asset' }}
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
            {filteredTokens.length
              ? filteredTokens.map(({ id, ...token }) => (
                  <Box
                    borderWidth={1}
                    borderColor="secondary.alpha12"
                    borderRadius="8px"
                    cursor="pointer"
                    py={3}
                    px={3}
                    key={id}
                    onClick={() => {
                      selectToken(id);
                      onClose();
                    }}
                  >
                    <TokenTag token={{ id, ...token }} variant="sm" />
                  </Box>
                ))
              : null}
          </Flex>
        </Box>
      </Box>
    </CustomModal>
  );
}
