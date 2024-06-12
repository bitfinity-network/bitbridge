import z from 'zod';

const str = z.string();

export const CHAIN_ID = z.number().parse(process.env.CHAIN_ID || 355113);

export const RPC_URL = str.parse(
  process.env.RPC_URL || 'http://127.0.0.1:8545'
);

export const IC_HOST = str.parse(
  process.env.IC_HOST || 'http://127.0.0.1:4943'
);

export const FEE_CHARGE_ADDRESS = str.parse(process.env.FEE_CHARGE_ADDRESS);

export const ICRC2_MINTER_CANISTER_ID = str.parse(
  process.env.ICRC2_MINTER_CANISTER_ID
);

export const ICRC2_TOKEN_CANISTER_ID = str.parse(
  process.env.ICRC2_TOKEN_CANISTER_ID
);

export const BTC_BRIDGE_CANISTER_ID = str.parse(
  process.env.BTC_BRIDGE_CANISTER_ID
);

export const RUNE_BRIDGE_CANISTER_ID = str.parse(
  process.env.RUNE_BRIDGE_CANISTER_ID
);

export const RUNE_TOKEN_ID = str.parse(process.env.RUNE_TOKEN_ID);

export const BFT_ETH_ADDRESS = str.parse(process.env.BFT_ETH_ADDRESS);

export const BTC_TOKEN_WRAPPED_ADDRESS = str.parse(
  process.env.BTC_TOKEN_WRAPPED_ADDRESS
);
