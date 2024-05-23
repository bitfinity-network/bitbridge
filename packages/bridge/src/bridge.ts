import { BridgeToken } from './tokens';

export interface Bridge {
  init(): Promise<void>;
  icWhitelist(): Promise<string[]>;
  idMatch(token: BridgeToken): boolean;
}
