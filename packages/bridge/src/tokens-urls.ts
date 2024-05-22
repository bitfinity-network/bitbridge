import z from 'zod';

import {
  FetchedToken,
  DeployedIcrcToken,
  DeployedBtcToken,
  DeployedRuneToken
} from './tokens-fetched';
import { TOKENS_MAIN_NET_URL, TOKENS_TEST_NET_URL } from './constants';

export const defaultDeployedTokens = [
  DeployedIcrcToken.parse({}),
  DeployedBtcToken.parse({}),
  DeployedRuneToken.parse({})
];

export const FetchUrlLocal = z.object({
  type: z.literal('local').default('local'),
  tokens: z.array(FetchedToken).default(defaultDeployedTokens)
});

export type FetchUrlLocal = z.infer<typeof FetchUrlLocal>;

export const FetchUrlRemote = z.object({
  type: z.literal('remote').default('remote'),
  src: z.string()
});

export type FetchUrlRemote = z.infer<typeof FetchUrlRemote>;

export const FetchUrl = z.discriminatedUnion('type', [
  FetchUrlLocal,
  FetchUrlRemote
]);

export type FetchUrl = z.infer<typeof FetchUrl>;

export const FetchRemoteSchema = z.object({
  tokens: z.array(FetchedToken)
});

export const remoteUrls = {
  testnet: TOKENS_TEST_NET_URL,
  mainnet: TOKENS_MAIN_NET_URL
};
