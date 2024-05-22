import { describe, expect, test } from 'vitest';

import { Connector } from '../';
import {
  createAgent,
  createBitfinityWallet,
  execSendIcrcToken,
  mintNativeToken,
  randomWallet
} from './utils';
import { wait } from '../utils';

describe.sequential(
  'icrc2',
  async () => {
    const wallet = randomWallet();

    const { agent, identity } = createAgent(wallet.privateKey);
    const bitfinityWallet = createBitfinityWallet(agent);

    await mintNativeToken(wallet.address, '10000000000000000');

    const connector = Connector.create({
      bridges: ['icrc'],
      wallet,
      bitfinityWallet
    });
    await connector.init();

    await connector.requestIcConnect();

    const icrcBricdge = connector.getBridge('icrc');

    test('deploy wrapped contract', async () => {
      await execSendIcrcToken(identity.getPrincipal().toText(), 1000000);

      await wait(5000);

      await icrcBricdge.deployBftWrappedToken('AUX', 'AUX');

      await wait(5000);

      const baseBalance = await icrcBricdge.getBaseTokenBalance(
        identity.getPrincipal().toText()
      );
      expect(baseBalance).toStrictEqual(1000000n);

      const wrappedBalance = await icrcBricdge.getWrappedTokenBalance(
        wallet.address
      );
      expect(wrappedBalance).toStrictEqual(0n);
    });

    test('bridge icrc2 token to evm', async () => {
      const amount = 100000n;

      console.log(await icrcBricdge.bridgeToEvmc(amount, wallet.address));

      await wait(15000);

      const balance = await icrcBricdge.getWrappedTokenBalance(wallet.address);
      expect(balance).toStrictEqual(amount);
    });

    test('bridge evmc tokens to icrc2', async () => {
      const amount = 1000n;

      const balance = await icrcBricdge.getBaseTokenBalance(
        identity.getPrincipal().toText()
      );
      expect(balance).toStrictEqual(899980n);

      console.log('balance', balance);

      await icrcBricdge.bridgeFromEvmc(
        identity.getPrincipal().toText(),
        amount
      );
    });
  },
  180000
);
