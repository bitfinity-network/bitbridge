export interface Bridge {
  init(): Promise<void>
  icWhitelist(): Promise<string[]>;
}
