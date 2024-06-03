import * as ethers from 'ethers';

import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import { BridgeToken } from '@bitfinity-network/bridge-tokens';

export interface Bridge {
  readonly bftAddress: string;
  icWhitelist(): string[];
  idMatch(token: BridgeToken): boolean;
  connectEthWallet(wallet?: ethers.Signer): void;
  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet): void;
}
