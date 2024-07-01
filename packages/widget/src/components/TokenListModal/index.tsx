import {
  Box,
  Flex,
  HStack,
  Image,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { CustomModal, SearchInput } from '../../ui';
import { TokenTag } from '../../ui/TokenTag';
import { WALLETS_INFO } from '../../provider/BridgeProvider.tsx';

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
      modalHeaderProps={{
        title: 'Select Token',
        iconPrefix: [IoMdArrowBack],
        onIconPrefixClick: [onClose],
        showCloseIcon: false
      }}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      modalContentProps={{
        width: '500px',
        height: 'auto',
        borderRadius: '20px',
        overflowY: 'hidden'
      }}
    >
      <Box>
        <Box py={2}>
          <Tabs>
            <TabList>
              <Tab _selected={{ color: 'primary.main' }}>
                <HStack gap="12px">
                  <Image
                    src={WALLETS_INFO.ic.logo}
                    width="24px"
                    height="24px"
                    flexShrink="0"
                  />
                  <Text>IC</Text>
                </HStack>
              </Tab>
              <Tab isDisabled _selected={{ color: 'primary.main' }}>
                <HStack gap="12px">
                  <Image
                    src={WALLETS_INFO.btc.logo}
                    width="24px"
                    height="24px"
                    flexShrink="0"
                  />
                  <Text>BTC</Text>
                </HStack>
              </Tab>
              <Tab isDisabled _selected={{ color: 'primary.main' }}>
                <HStack gap="12px">
                  <Image
                    src={WALLETS_INFO.eth.logo}
                    width="24px"
                    height="24px"
                    flexShrink="0"
                  />
                  <Text>ETH</Text>
                </HStack>
              </Tab>
            </TabList>
            <TabIndicator
              mt="-1.5px"
              height="2px"
              bg="primary.main"
              borderRadius="1px"
            />
            <TabPanels padding="0">
              <TabPanel paddingX="0" paddingY={4}>
                <SearchInput
                  placeholder="Search token"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="xs"
                  sx={{
                    borderRadius: '12px',
                    borderWidth: 1,
                    borderColor: 'bg.border',
                    bg: 'bg.module'
                  }}
                />
                <Box paddingTop={4}>
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
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </CustomModal>
  );
}
