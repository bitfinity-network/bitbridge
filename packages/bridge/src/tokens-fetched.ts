import z from 'zod';

import {
  BridgeIcrcToken,
  BridgeBtcToken,
  BridgeRuneToken,
  BridgeToken
} from './tokens';
import {
  BFT_ETH_ADDRESS,
  BTC_BRIDGE_CANISTER_ID,
  IC_HOST,
  ICRC2_MINTER_CANISTER_ID,
  ICRC2_TOKEN_CANISTER_ID,
  RUNE_BRIDGE_CANISTER_ID
} from './constants';

export const DeployBaseToken = z.object({
  icHost: z.string().url().default(IC_HOST),
  bftAddress: z.string().default(BFT_ETH_ADDRESS)
});

// ICRC

export const DeployedIcrcToken = DeployBaseToken.extend({
  type: z.literal('icrc'),
  baseTokenCanisterId: z.string().default(ICRC2_TOKEN_CANISTER_ID),
  name: z.string().default('AUX'),
  symbol: z.string().default('AUX'),
  iCRC2MinterCanisterId: z.string().default(ICRC2_MINTER_CANISTER_ID)
});

export const FetchedIcrcToken = z.union([BridgeIcrcToken, DeployedIcrcToken]);
export type FetchedIcrcToken = z.infer<typeof FetchedIcrcToken>;

// BTC

export const DeployedBtcToken = DeployBaseToken.extend({
  type: z.literal('btc'),
  name: z.string().default('BTC'),
  symbol: z.string().default('BTC'),
  btcBridgeCanisterId: z.string().default(BTC_BRIDGE_CANISTER_ID)
});

export const FetchedBtcToken = z.union([BridgeBtcToken, DeployedBtcToken]);
export type FetchedBtcToken = z.infer<typeof FetchedBtcToken>;

// Runes

export const DeployedRuneToken = DeployBaseToken.extend({
  type: z.literal('rune'),
  runeId: z.string().default('RUNERUNERUNERUNE'),
  name: z.string().default('RUNERUNERUNERUNE'),
  symbol: z.string().default('R'),
  runeBridgeCanisterId: z.string().default(RUNE_BRIDGE_CANISTER_ID)
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

export const splitTokens = (
  tokens: FetchedToken[]
): [BridgeToken[], DeployedToken[]] => {
  const bridged: BridgeToken[] = [];
  const deployed: DeployedToken[] = [];

  tokens.forEach((token) => {
    if (token.type === 'icrc' && 'wrappedTokenAddress' in token) {
      bridged.push(token);
    } else if (token.type === 'btc' && 'wrappedTokenAddress' in token) {
      bridged.push(token);
    } else if (token.type === 'rune' && 'wrappedTokenAddress' in token) {
      bridged.push(token);
    } else if (token.type === 'icrc' && 'symbol' in token) {
      deployed.push(token);
    } else if (token.type === 'btc' && 'symbol' in token) {
      deployed.push(token);
    } else if (token.type === 'rune' && 'symbol' in token) {
      deployed.push(token);
    }
  });

  return [bridged, deployed];
};