import { describe, expect, test } from 'vitest';

import { Connector } from '../';
import {
  createAgent,
  createBitfinityWallet,
  execBitcoinCmd,
  execOrdReceive,
  execOrdSend,
  mintNativeToken,
  randomWallet
} from './utils';
import { wait } from '../utils';

describe.sequential(
  'rune',
  async () => {
    const RUNE_NAME = 'SUPERMAXRUNENAME';

    const wallet = randomWallet();

    const { agent } = createAgent(wallet.privateKey);
    const bitfinityWallet = createBitfinityWallet(agent);

    await mintNativeToken(wallet.address, '10000000000000000');

    const connector = Connector.create({
      bridges: ['rune'],
      wallet,
      bitfinityWallet
    });
    await connector.init();

    await connector.requestIcConnect();

    const runeBridge = connector.getBridge('rune');

    test('bridge to evm', async () => {
      const toAddress = wallet.address;

      const address = await runeBridge.getDepositAddress(toAddress);

      const wrappedBalance = await runeBridge.getWrappedTokenBalance(toAddress);
      expect(wrappedBalance).toStrictEqual(0n);

      const sendResult = await execOrdSend(address, RUNE_NAME);
      expect(
        sendResult,
        'Impossible to send rune. Is it mined to the wallet?'
      ).not.toStrictEqual(null);

      await execBitcoinCmd(`sendtoaddress ${address} 0.0049`);
      await execBitcoinCmd(
        `generatetoaddress 1 bcrt1q7xzw9nzmsvwnvfrx6vaq5npkssqdylczjk8cts`
      );

      await runeBridge.bridgeToEvmc(toAddress);

      await wait(15000);

      const wrappedBalance2 =
        await runeBridge.getWrappedTokenBalance(toAddress);

      expect(wrappedBalance2).toStrictEqual(1000n);
    });

    test('bridge from evm', async () => {
      const toAddress = await execOrdReceive();

      await runeBridge.bridgeFromEvmc(toAddress, 100);

      await wait(15000);

      const wrappedBalance = await runeBridge.getWrappedTokenBalance(
        wallet.address
      );
      expect(wrappedBalance).toStrictEqual(900n);
    });
  },
  180000
);
