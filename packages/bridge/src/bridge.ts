import { BridgeToken } from './tokens';
import { BitfinityWallet } from '@bitfinity-network/bitfinitywallet';
import * as ethers from 'ethers';

export interface Bridge {
  icWhitelist(): string[];
  idMatch(token: BridgeToken): boolean;
  connectEthWallet(wallet?: ethers.Signer): void;
  connectBitfinityWallet(bitfinityWallet?: BitfinityWallet): void;
}
