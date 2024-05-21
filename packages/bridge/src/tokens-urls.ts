import z from 'zod';

import {
  FetchedToken,
  DeployedIcrcToken,
  DeployedBtcToken,
  DeployedRuneToken
} from './tokens-fetched';

export const defaultDeployedTokens = [
  DeployedIcrcToken.parse({ type: 'icrc' })
  // DeployedBtcToken.parse({ type: 'btc' }),
  // DeployedRuneToken.parse({ type: 'rune' })
];

export const FetchUrlLocal = z.object({
  type: z.literal('local'),
  tokens: z.array(FetchedToken).default(defaultDeployedTokens)
});

export type FetchUrlLocal = z.infer<typeof FetchUrlLocal>;

export const FetchUrlRemote = z.object({
  type: z.literal('remote'),
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
