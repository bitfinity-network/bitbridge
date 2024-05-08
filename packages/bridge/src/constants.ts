import z from 'zod';
import { EthAddress } from './validation';

const str = z.string();

export const CHAIN_ID = z.number().parse(process.env.CHAIN_ID || 355113);

export const RPC_URL = str.parse(
  process.env.RPC_URL || 'http://127.0.0.1:8545'
);

export const IC_HOST = str.parse(
  process.env.IC_HOST || 'http://127.0.0.1:4943'
);

export const LOCAL_TEST_SEED_PHRASE = str.parse(
  process.env.LOCAL_TEST_SEED_PHRASE ||
    'piece cabin metal credit library hobby fetch nature topple region nominee always'
);

export const ICRC2_MINTER_CANISTER_ID = str.parse(
  process.env.ICRC2_MINTER_CANISTER_ID
);

export const ICRC2_TOKEN_CANISTER_ID = str.parse(
  process.env.ICRC2_TOKEN_CANISTER_ID
);

export const BTC_BRIDGE_CANISTER_ID = str.parse(
  process.env.BTC_BRIDGE_CANISTER_ID
);

// export const CKBTC_TOKEN_CANISTER_ID = str.parse(
//   process.env.CKBTC_TOKEN_CANISTER_ID
// );
//
// export const CK_BTC_CANISTER_ID = str.parse(process.env.CK_BTC_CANISTER_ID);

export const IS_TEST = z.boolean().parse(process.env.IS_TEST || false);

// export const BTC_BRIDGE_ETH_ADDRESS = str.parse(
//   process.env.BTC_BRIDGE_ETH_ADDRESS
// );

export const BFT_ETH_ADDRESS = str.parse(
  process.env.BFT_ETH_ADDRESS
) as EthAddress;

export const BTC_TOKEN_WRAPPED_ADDRESS = str.parse(
  process.env.BTC_TOKEN_WRAPPED_ADDRESS
);
