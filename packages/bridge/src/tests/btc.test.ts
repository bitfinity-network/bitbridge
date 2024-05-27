import { describe, expect, test } from 'vitest';
import bitcore from 'bitcore-lib';

import { BTC_TOKEN_WRAPPED_ADDRESS, Connector } from '..';
import {
  randomWallet,
  mintNativeToken,
  execBitcoinCmd,
  createAnnonAgent
} from './utils';
import { wait } from '../utils';

describe.sequential(
  'btc',
  async () => {
    const wallet = randomWallet();

    const { agent } = createAnnonAgent();

    await mintNativeToken(wallet.address, '10000000000000000');

    await wait(1000);

    const connector = Connector.create({ agent });

    connector.connectEthWallet(wallet);

    await connector.fetchLocal();
    await connector.bridge();

    await wait(1000);

    const btcBridge = connector.getBridge<'btc'>(BTC_TOKEN_WRAPPED_ADDRESS);

    test('get balance', async () => {
      const wrappedBalance = await btcBridge.getWrappedTokenBalance(
        wallet.address
      );

      expect(wrappedBalance).toStrictEqual(0n);
    });

    test('bridge to evm', async () => {
      const btcAddress = await btcBridge.getBTCAddress(wallet.address);

      await execBitcoinCmd(
        `sendtoaddress "${btcAddress}" ${bitcore.Unit.fromSatoshis(1000000000).toBTC()}`
      );
      await execBitcoinCmd(
        `generatetoaddress 1 "bcrt1quv0zt5ep4ksx8l2tgtgpfd7fsz6grr0wek3rg7"`
      );
      await wait(10000);

      await btcBridge.bridgeToEvmc(wallet.address);

      await wait(5000);

      const wrappedBalance = await btcBridge.getWrappedTokenBalance(
        wallet.address
      );

      expect(wrappedBalance).toStrictEqual(999998990n);
    });

    test('bridge from evm', async () => {
      const address = (await execBitcoinCmd('getnewaddress')).trim();

      await btcBridge.bridgeFromEvmc(address, 100000000);

      await execBitcoinCmd(
        `generatetoaddress 1 "bcrt1quv0zt5ep4ksx8l2tgtgpfd7fsz6grr0wek3rg7"`
      );

      await wait(5000);

      const wrappedBalance = await btcBridge.getWrappedTokenBalance(
        wallet.address
      );
      expect(wrappedBalance).toStrictEqual(899998990n);
    });
  },
  180000
);
