export type DeployWrappedToken = {
  id: string;
  name: string;
  symbol: string;
};

export type BridgeToEvmc = {
  token: string;
  owner: string;
  recipient: string;
  amount: bigint;
};

export type BridgeFromEvmc = {
  wrappedToken: string;
  recipient: string;
  amount: bigint;
};

export interface Bridge {
  icWhitelist(): string[];
  deployWrappedToken(params: DeployWrappedToken): Promise<any>;
  bridgeToEvmc(params: BridgeToEvmc): Promise<any>;
  bridgeFromEvmc(params: BridgeFromEvmc): Promise<any>;
  getTokensPairs(): Promise<{ wrapped: string; base: string }[]>;
  getBaseTokenBalance(base: string, address: string): Promise<bigint>;
  getWrappedTokenBalance(wrapped: string, address: string): Promise<bigint>;
  getWrappedTokenInfo(
    wrapped: string
  ): Promise<{ name: string; symbol: string; decimals: number }>;
}
