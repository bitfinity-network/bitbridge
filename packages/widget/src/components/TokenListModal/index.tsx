import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { Token, useTokenContext } from '../../provider/TokensProvider.tsx';
import { CustomModal, SearchInput } from '../../ui';
import { TokenTag } from '../../ui/TokenTag';

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectToken: (token: Token) => void;
};

export function TokenListModal({
  isOpen,
  onClose,
  selectToken
}: TokenListModelProps) {
  const { tokens } = useTokenContext();

  console.log('Tokens', tokens);

  const [search, setSearch] = useState('');

  const filteredTokens = tokens.filter((token) => {
    if (!search.length) {
      return token;
    }

    const needle = search.trim().toLowerCase();

    const searchable = [token.name, token.symbol].map((str) =>
      str.trim().toLowerCase()
    );

    return searchable.find((haystack) => {
      return haystack.match(new RegExp(needle));
    });
  });

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
            {filteredTokens?.length
              ? filteredTokens.map((token) => {
                  return (
                    <Box
                      borderWidth={1}
                      borderColor="secondary.alpha12"
                      cursor="pointer"
                      py={2}
                      px={3}
                      key={token.symbol}
                      onClick={() => {
                        selectToken(token);
                        onClose();
                      }}
                    >
                      {token ? (
                        <TokenTag
                          name={token.name || token.symbol || ''}
                          img={token?.logo || ''}
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
