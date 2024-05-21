import z from 'zod';

export const BridgeBaseToken = z.object({
  bftAddress: z.string()
});

export const BridgeIcrcToken = BridgeBaseToken.extend({
  type: z.literal('icrc').default('icrc'),
  baseTokenCanisterId: z.string(),
  wrappedTokenAddress: z.string(),
  iCRC2MinterCanisterId: z.string()
});

export type BridgeIcrcToken = z.infer<typeof BridgeIcrcToken>;

export const BridgeBtcToken = BridgeBaseToken.extend({
  type: z.literal('btc').default('btc'),
  name: z.string(),
  wrappedTokenAddress: z.string(),
  btcBridgeCanisterId: z.string()
});

export type BridgeBtcToken = z.infer<typeof BridgeBtcToken>;

export const BridgeRuneToken = BridgeBaseToken.extend({
  type: z.literal('rune').default('rune'),
  runeId: z.string(),
  wrappedTokenAddress: z.string(),
  runeBridgeCanisterId: z.string()
});

export type BridgeRuneToken = z.infer<typeof BridgeRuneToken>;

export const BridgeToken = z.discriminatedUnion('type', [
  BridgeIcrcToken,
  BridgeBtcToken,
  BridgeRuneToken
]);

export type BridgeToken = z.infer<typeof BridgeToken>;

export const id = (token: BridgeToken) => {
  const id1 = token.wrappedTokenAddress.toLowerCase();

  if (token.type === 'icrc') {
    return `${id1}:${token.baseTokenCanisterId.replace('-', '').toLowerCase()}`;
  }

  return id1;
};

export const idMatch = (t1: BridgeToken, t2: BridgeToken) => {
  return id(t1) === id(t2);
};

export const idStrMatch = (str: string, token: BridgeToken) => {
  const ids = id(token).split(':');

  return ids.includes(str.replace('-', '').toLowerCase());
};
