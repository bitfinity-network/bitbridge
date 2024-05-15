import { EthAddress } from './validation';

export const CHAIN_ID = 355113;

export const RPC_URL = 'http://127.0.0.1:8544';

export const IC_HOST = 'http://127.0.0.1:4943';

export const LOCAL_TEST_SEED_PHRASE =
  'piece cabin metal credit library hobby fetch nature topple region nominee always';

export const ICRC2_MINTER_CANISTER_ID = 'br5f7-7uaaa-aaaaa-qaaca-cai';

export const ICRC2_TOKEN_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

export const BTC_BRIDGE_CANISTER_ID = '';

// export const CKBTC_TOKEN_CANISTER_ID = str.parse(
//   process.env.CKBTC_TOKEN_CANISTER_ID
// );
//
// export const CK_BTC_CANISTER_ID = str.parse(process.env.CK_BTC_CANISTER_ID);

export const IS_TEST = false;

// export const BTC_BRIDGE_ETH_ADDRESS = str.parse(
//   process.env.BTC_BRIDGE_ETH_ADDRESS
// );

export const BFT_ETH_ADDRESS =
  '0x37d9823369d046f8068a35edec0bcfb107beceee' as EthAddress;

export const BTC_TOKEN_WRAPPED_ADDRESS =
  process.env.BTC_TOKEN_WRAPPED_ADDRESS ||
  '0x932cc1690d13641db3279fd3c04c446adef4e19e';
