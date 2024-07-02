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
import { WALLETS_INFO, WalletType } from '../../provider/BridgeProvider.tsx';
import { TokenType } from '../../provider/TokensListsProvider.tsx';

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
  selectToken: (tokenId: string) => void;
};

export const tokenMap: Record<TokenType, WalletType> = {
  icrc: 'ic',
  btc: 'btc',
  evmc: 'eth',
  rune: 'btc'
};

export function TokenListModal({
  isOpen,
  onClose,
  selectToken
}: TokenListModelProps) {
  const [tab, setTab] = useState('eth');
  const { tokens } = useTokenContext();

  const tabTokens = useMemo(() => {
    return tokens.filter(({ type }) => {
      return tokenMap[type] === tab;
    });
  }, [tokens, tab]);

  const [search, setSearch] = useState<string>('');

  const filteredTokens = useMemo(() => {
    if (!search.length) {
      return tabTokens;
    }

    const needle = search.trim().toLowerCase();

    return tabTokens.filter(({ name, symbol }) => {
      const searchable = [name, symbol].map((str) => str.trim().toLowerCase());
      return searchable.some((haystack) => haystack.includes(needle));
    });
  }, [search, tabTokens]);

  const tabsLabels = Object.entries(WALLETS_INFO).map(([symbol, { logo }]) => {
    return (
      <Tab
        _selected={{ color: 'primary.main' }}
        onSelect={() => {
          console.log('1');
          setTab(symbol);
        }}
        key={symbol}
      >
        <HStack gap="12px">
          <Image src={logo} width="24px" height="24px" flexShrink="0" />
          <Text>{symbol.toUpperCase()}</Text>
        </HStack>
      </Tab>
    );
  });

  const panels = ['eth', 'btc', 'ic'].map((symbol) => {
    return (
      <TabPanel paddingX="0" paddingY={4} key={symbol}>
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
            {filteredTokens.map(({ id, ...token }) => (
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
            ))}
          </Flex>
        </Box>
      </TabPanel>
    );
  });

  const handleTabChange = (index: number) => {
    setTab(Object.keys(WALLETS_INFO)[index]);
  };

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
          <Tabs onChange={handleTabChange}>
            <TabList>{tabsLabels}</TabList>
            <TabIndicator
              mt="-1.5px"
              height="2px"
              bg="primary.main"
              borderRadius="1px"
            />
            <TabPanels padding="0">{panels}</TabPanels>
          </Tabs>
        </Box>
      </Box>
    </CustomModal>
  );
}
