import z from 'zod';

import { BridgeIcrcToken, BridgeBtcToken, BridgeRuneToken } from './tokens';

export const DeployBaseToken = z.object({
  bftAddress: z.string()
});

// ICRC

export const DeployedIcrcToken = DeployBaseToken.extend({
  type: z.literal('icrc').default('icrc'),
  name: z.string().default('AUX'),
  symbol: z.string().default('AUX'),
  baseTokenCanisterId: z.string(),
  iCRC2MinterCanisterId: z.string()
});

export const FetchedIcrcToken = z.union([BridgeIcrcToken, DeployedIcrcToken]);
export type FetchedIcrcToken = z.infer<typeof FetchedIcrcToken>;

// BTC

export const DeployedBtcToken = DeployBaseToken.extend({
  type: z.literal('btc').default('btc'),
  btcBridgeCanisterId: z.string(),
  wrappedTokenAddress: z.string()
});

export const FetchedBtcToken = z.union([BridgeBtcToken, DeployedBtcToken]);
export type FetchedBtcToken = z.infer<typeof FetchedBtcToken>;

// Runes

export const DeployedRuneToken = DeployBaseToken.extend({
  type: z.literal('rune').default('rune'),
  runeId: z.string(),
  runeBridgeCanisterId: z.string(),
  name: z.string().default('RUNERUNERUNERUNE')
});

export const FetchedRuneToken = z.union([BridgeRuneToken, DeployedRuneToken]);
export type FetchedRuneToken = z.infer<typeof FetchedRuneToken>;

// All local tokens

export const DeployedToken = z.discriminatedUnion('type', [
  DeployedIcrcToken,
  DeployedBtcToken,
  DeployedRuneToken
]);
export type DeployedToken = z.infer<typeof DeployedToken>;

// All fetched tokens

export const FetchedToken = z.union([
  FetchedIcrcToken,
  FetchedBtcToken,
  FetchedRuneToken
]);
export type FetchedToken = z.infer<typeof FetchedToken>;

export const id = (token: FetchedToken) => {
  if (token.type === 'icrc') {
    return token.baseTokenCanisterId.replace(/-/g, '').toLowerCase();
  } else if (token.type === 'btc') {
    return token.wrappedTokenAddress.toLowerCase();
  } else {
    return token.runeId.toLowerCase();
  }
};
