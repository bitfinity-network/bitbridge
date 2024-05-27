import { describe, expect, test } from 'vitest';

import { Connector, IcrcBridge } from '..';
import {
  createAgent,
  createBitfinityWallet,
  mintNativeToken,
  randomWallet
} from './utils';
import { BridgeIcrcToken } from '../tokens';
import { wait } from '../utils';

describe('connector', async () => {
  const wallet = randomWallet();

  const { agent } = createAgent(wallet.privateKey);
  const bitfinityWallet = createBitfinityWallet(agent);

  await mintNativeToken(wallet.address, '10000000000000000');

  await wait(1000);

  test('create', async () => {
    const connector = Connector.create({ agent });

    expect(connector.getBridgedTokens()).toHaveLength(0);
  });

  test('bridges created properly on wallets connection', async () => {
    const connector = Connector.create({ agent });

    const fetchedCount = await connector.fetchLocal();
    expect(fetchedCount).toStrictEqual(3);

    await connector.bridge();

    expect(connector.getBridgedTokens()).toHaveLength(1);

    connector.connectEthWallet(wallet);

    await connector.bridge();
    expect(connector.getBridgedTokens()).toHaveLength(3);
  });

  test('testing custom local urls', async () => {
    const connector = Connector.create({ agent });

    connector.connectBitfinityWallet(bitfinityWallet);

    const icrcToken = BridgeIcrcToken.parse({
      icHost: 'http://localhost:9001',
      bftAddress: 'bftAddress',
      baseTokenCanisterId: 'baseTokenCanisterId',
      wrappedTokenAddress: 'wrappedTokenAddress',
      iCRC2MinterCanisterId: '1'
    });

    await connector.fetch([{ type: 'local', tokens: [icrcToken] }]);

    await connector.bridge();

    expect(connector.getBridgedTokens()).toHaveLength(1);

    expect(
      connector.getBridgedToken('baseTokenCanisterId')?.bftAddress
    ).toBeTypeOf('string');
    expect(
      connector.getBridgedToken('baseTokenCanisterId')?.bftAddress
    ).toStrictEqual(
      connector.getBridgedToken('wrappedTokenAddress')?.bftAddress
    );

    const bridge = connector.getBridge<'icrc'>('baseTokenCanisterId');
    expect(bridge).toBeInstanceOf(IcrcBridge);
  });
}, 180000);
