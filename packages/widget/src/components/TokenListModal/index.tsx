import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { useTokenContext } from '../../provider/TokensProvider.tsx';
import { CustomModal, SearchInput } from '../../ui';
import { TokenTag } from '../../ui/TokenTag';
import { WALLETS_INFO, WalletType } from '../../provider/BridgeProvider.tsx';
import { TokenType } from '../../provider/TokensListsProvider.tsx';
import { LuCopy } from 'react-icons/lu';
import { shortenAddress } from '../../utils';

type TokenListModelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const tokenMap: Record<TokenType, WalletType> = {
  icrc: 'ic',
  btc: 'btc',
  evmc: 'eth',
  rune: 'btc'
};

const normalize = (str: string) => {
  return str.trim().toLowerCase().replace(/-/g, '').replace(/^0x/, '');
};

export function TokenListModal({ isOpen, onClose }: TokenListModelProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const { tokens, setSelectedToken } = useTokenContext();
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({});

  const tabTokens = useMemo(() => {
    return tokens.filter(({ type }) => {
      return tokenMap[type] === Object.keys(WALLETS_INFO)[tabIndex];
    });
  }, [tokens, tabIndex]);

  const [search, setSearch] = useState<string>('');

  const filteredTokens = useMemo(() => {
    if (!search.length) {
      return tabTokens;
    }

    return tabTokens.filter(({ name, symbol, id }) => {
      return [name, symbol, id].some((haystack) =>
        normalize(haystack).includes(normalize(search))
      );
    });
  }, [search, tabTokens]);

  const tabsLabels = Object.values(WALLETS_INFO).map(({ logo, symbol }) => {
    return (
      <Tab _selected={{ color: 'primary.main' }} key={symbol}>
        <HStack gap="12px">
          <Image src={logo} width="24px" height="24px" flexShrink="0" />
          <Text>{symbol.toUpperCase()}</Text>
        </HStack>
      </Tab>
    );
  });

  const panels = Object.keys(WALLETS_INFO).map((symbol) => {
    return (
      <TabPanel
        paddingX="0"
        paddingY={4}
        key={symbol}
        height="300px"
        overflowY="auto"
      >
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
            {filteredTokens.map(({ id, ...token }) => {
              const fallbackSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${token.name}`;

              return (
                <Popover
                  key={id}
                  isOpen={popoverOpen[id] || false}
                  trigger="hover"
                  openDelay={1500}
                  onClose={() =>
                    setPopoverOpen((prev) => ({ ...prev, [id]: false }))
                  }
                  onOpen={() =>
                    setPopoverOpen((prev) => ({ ...prev, [id]: true }))
                  }
                >
                  <PopoverTrigger>
                    <Box
                      borderWidth={1}
                      borderColor="secondary.alpha12"
                      borderRadius="8px"
                      cursor="pointer"
                      py={3}
                      px={3}
                      onClick={() => {
                        setSelectedToken(id);
                        onClose();
                      }}
                      _hover={{
                        bg: 'bg.module'
                      }}
                    >
                      <TokenTag token={{ id, ...token }} variant="sm" />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent width="auto">
                    <PopoverArrow bg="bg.popover" />
                    <PopoverBody
                      bg="bg.popover"
                      width="auto"
                      borderRadius="8px"
                    >
                      <HStack alignItems="center" gap="16px" padding="8px">
                        <Image
                          src={token.logo || fallbackSrc}
                          fallbackSrc={fallbackSrc}
                          alt={token.name}
                          h="20px"
                          w="20px"
                        />
                        <Text as="span" isTruncated={true} color="text.popover">
                          {shortenAddress(id, 7, 5)}
                        </Text>
                        <HStack
                          as="button"
                          onClick={() => {
                            navigator.clipboard.writeText(id);
                            setPopoverOpen((prev) => ({
                              ...prev,
                              [id]: false
                            }));
                          }}
                          background="bg.main"
                          width="24px"
                          height="24px"
                          padding="8px"
                          borderRadius="8px"
                          alignItems="center"
                          justifyContent="center"
                          _hover={{
                            bg: 'bg.module'
                          }}
                        >
                          <Icon as={LuCopy} color="text.primary" />
                        </HStack>
                      </HStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              );
            })}
          </Flex>
        </Box>
      </TabPanel>
    );
  });

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
          <Tabs index={tabIndex} onChange={setTabIndex}>
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
