import { describe, expect, test } from 'vitest';

import { Connector } from '../';
import {
  createAgent,
  createBitfinityWallet,
  execSendIcrcToken,
  mintNativeToken,
  randomWallet
} from './utils';
import { ICRC2_TOKEN_CANISTER_ID } from '../constants';
import { wait } from '../utils';

describe.sequential(
  'icrc2',
  async () => {
    const wallet = randomWallet();

    const { agent, identity } = createAgent(wallet.privateKey);
    const bitfinityWallet = createBitfinityWallet(agent);

    await mintNativeToken(wallet.address, '10000000000000000');
    await execSendIcrcToken(identity.getPrincipal().toText(), 1000000);

    await wait(1000);

    const connector = Connector.create({ agent });

    connector.connectEthWallet(wallet);
    connector.connectBitfinityWallet(bitfinityWallet);

    await connector.fetchLocal();
    await connector.bridge();

    await wait(1000);

    const icrcBricdge = connector.getBridge<'icrc'>(ICRC2_TOKEN_CANISTER_ID);

    test('bridge icrc2 token to evm', async () => {
      const amount = 100000n;

      await icrcBricdge.bridgeToEvmc(amount, wallet.address);

      await wait(10000);

      const balance = await icrcBricdge.getWrappedTokenBalance(wallet.address);
      expect(balance).toStrictEqual(amount);
    });

    test('bridge evmc tokens to icrc2', async () => {
      const amount = 1000n;

      const balance = await icrcBricdge.getBaseTokenBalance(
        identity.getPrincipal().toText()
      );
      expect(balance).toStrictEqual(899980n);

      await icrcBricdge.bridgeFromEvmc(
        identity.getPrincipal().toText(),
        amount
      );

      const balance2 = await icrcBricdge.getBaseTokenBalance(
        identity.getPrincipal().toText()
      );
      expect(balance2).toStrictEqual(901960n);
    });
  },
  180000
);
