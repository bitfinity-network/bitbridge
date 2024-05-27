import { describe, expect, test } from 'vitest';

import { Connector } from '../';
import {
  createAnnonAgent,
  execBitcoinCmd,
  execOrdReceive,
  execOrdSend,
  mintNativeToken,
  randomWallet
} from './utils';
import { wait } from '../utils';
import { RUNE_TOKEN_ID } from '../constants';

describe.sequential(
  'rune',
  async () => {
    const RUNE_NAME = 'SUPERMAXRUNENAME';

    const wallet = randomWallet();

    const { agent } = createAnnonAgent();

    await mintNativeToken(wallet.address, '10000000000000000');

    await wait(1000);

    const connector = Connector.create({ agent });

    connector.connectEthWallet(wallet);

    await connector.fetchLocal();
    await connector.bridge();

    await wait(1000);

    const runeBridge = connector.getBridge<'rune'>(RUNE_TOKEN_ID);

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

      await wait(1000);

      await runeBridge.bridgeToEvmc(toAddress);

      await wait(5000);

      const wrappedBalance2 =
        await runeBridge.getWrappedTokenBalance(toAddress);

      expect(wrappedBalance2).toStrictEqual(1000n);
    });

    test('bridge from evm', async () => {
      const toAddress = await execOrdReceive();

      await runeBridge.bridgeFromEvmc(toAddress, 100);

      await wait(1000);

      const wrappedBalance = await runeBridge.getWrappedTokenBalance(
        wallet.address
      );
      expect(wrappedBalance).toStrictEqual(900n);
    });
  },
  180000
);
