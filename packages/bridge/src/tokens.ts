import {
  FetchUrlLocal,
  DeployedIcrcToken,
  DeployedBtcToken,
  DeployedRuneToken
} from '@bitfinity-network/bridge-tokens';

import {
  BFT_ETH_ADDRESS,
  BTC_BRIDGE_CANISTER_ID,
  ICRC2_MINTER_CANISTER_ID,
  ICRC2_TOKEN_CANISTER_ID,
  RUNE_BRIDGE_CANISTER_ID,
  BTC_TOKEN_WRAPPED_ADDRESS,
  RUNE_TOKEN_ID
} from './constants';

export const defaultDeployedTokens = [
  DeployedIcrcToken.parse({
    bftAddress: BFT_ETH_ADDRESS,
    baseTokenCanisterId: ICRC2_TOKEN_CANISTER_ID,
    iCRC2MinterCanisterId: ICRC2_MINTER_CANISTER_ID
  }),
  DeployedBtcToken.parse({
    bftAddress: BFT_ETH_ADDRESS,
    btcBridgeCanisterId: BTC_BRIDGE_CANISTER_ID,
    wrappedTokenAddress: BTC_TOKEN_WRAPPED_ADDRESS
  }),
  DeployedRuneToken.parse({
    bftAddress: BFT_ETH_ADDRESS,
    runeId: RUNE_TOKEN_ID,
    runeBridgeCanisterId: RUNE_BRIDGE_CANISTER_ID
  })
];

export const defaultLocalUrl = FetchUrlLocal.parse({
  tokens: defaultDeployedTokens
});
