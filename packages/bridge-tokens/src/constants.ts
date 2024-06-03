import z from 'zod';

const str = z.string();

export const TOKENS_MAIN_NET_URL = str
  .url()
  .parse(process.env.TOKENS_MAINNET_URL || 'https://example.com');

export const TOKENS_TEST_NET_URL = str
  .url()
  .parse(process.env.TOKENS_MAINNET_URL || 'https://example.com');
