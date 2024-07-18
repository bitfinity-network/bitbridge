import { describe, expect, test } from 'vitest';

import { Connector, ICRC2_TOKEN_CANISTER_ID } from '../';
import {
  createAgent,
  createBitfinityWallet,
  execSendIcrcToken,
  mintNativeToken,
  randomWallet,
  testNetwork
} from './utils';
import { wait } from '../utils';

describe.sequential(
  'icrc2',
  async () => {
    const wallet = randomWallet();

    const { agent, identity } = createAgent(wallet.privateKey);
    const bitfinityWallet = createBitfinityWallet(agent);

    await mintNativeToken(wallet.address, '1000000000000000000');
    await execSendIcrcToken(identity.getPrincipal().toText(), 100000000);
    await wait(3000);

    const connector = Connector.create();

    connector.connectEthWallet(wallet);
    connector.connectBitfinityWallet(bitfinityWallet);

    connector.addNetwork(testNetwork);

    const icrcBricdge = connector.getBridge('devnet', 'icrc_evm');

    test('deploy icrc2 token to evm', async () => {
      const wrapped = await icrcBricdge.deployWrappedToken({
        id: ICRC2_TOKEN_CANISTER_ID,
        name: 'AUX',
        symbol: 'AUX'
      });
      expect(wrapped).toBeTypeOf('string');

      const balance = await icrcBricdge.getWrappedTokenBalance(
        wrapped,
        wallet.address
      );
      expect(balance).toStrictEqual(0n);
    });

    test('bridge icrc2 token to evm', async () => {
      const amount = 100000n;

      await icrcBricdge.bridgeToEvmc({
        token: ICRC2_TOKEN_CANISTER_ID,
        owner: identity.getPrincipal().toText(),
        recipient: wallet.address,
        amount
      });

      await wait(10000);

      const wrapped = await icrcBricdge.getWrappedTokenAddress(
        ICRC2_TOKEN_CANISTER_ID
      );

      const balance = await icrcBricdge.getWrappedTokenBalance(
        wrapped,
        wallet.address
      );
      expect(balance).toStrictEqual(amount);
    });

    test('bridge evmc tokens to icrc2', async () => {
      const amount = 1000n;

      const balance = await icrcBricdge.getBaseTokenBalance(
        ICRC2_TOKEN_CANISTER_ID,
        identity.getPrincipal().toText()
      );
      expect(balance).toStrictEqual(99899980n);

      const wrapped = await icrcBricdge.getWrappedTokenAddress(
        ICRC2_TOKEN_CANISTER_ID
      );

      await icrcBricdge.bridgeFromEvmc({
        wrappedToken: wrapped,
        recipient: identity.getPrincipal().toText(),
        amount
      });

      const balance2 = await icrcBricdge.getBaseTokenBalance(
        ICRC2_TOKEN_CANISTER_ID,
        identity.getPrincipal().toText()
      );
      expect(balance2).toStrictEqual(99900970n);
    });
  },
  280000
);
