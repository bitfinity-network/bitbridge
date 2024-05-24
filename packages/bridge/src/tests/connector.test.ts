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
    const connector = Connector.create({ wallet, agent });

    expect(connector.getBridgedTokens()).toHaveLength(0);
  });

  test('fetch local', async () => {
    const connector = Connector.create({ wallet, agent });

    const fetchedCount = await connector.fetchLocal();

    expect(fetchedCount).toStrictEqual(3);
  });

  test('bridge local without deploy', async () => {
    const connector = Connector.create({ wallet, agent });

    await connector.fetchLocal();

    const bridgedCount = connector.bridge();

    expect(bridgedCount).toStrictEqual(1);
    expect(connector.getBridgedTokens()).toHaveLength(1);
  });

  test('bridge after deploy', async () => {
    const connector = Connector.create({ wallet, agent });

    const fetchedCount = await connector.fetchLocal();
    expect(fetchedCount).toStrictEqual(3);

    const bridgedCount = await connector.bridgeAfterDeploy();
    expect(bridgedCount).toStrictEqual(2);

    const bridgedCount2 = await connector.bridgeAfterDeploy();
    expect(bridgedCount2).toStrictEqual(0);

    expect(connector.getBridgedTokens()).toHaveLength(3);

    connector.connectBitfinityWallet(bitfinityWallet);

    const fetchedCount2 = await connector.fetchLocal();
    expect(fetchedCount2).toStrictEqual(3);

    const bridgedCount3 = await connector.bridgeAfterDeploy(true);
    expect(bridgedCount3).toStrictEqual(1);
  });

  test('testing custom local urls', async () => {
    const connector = Connector.create({ wallet, agent });

    connector.connectBitfinityWallet(bitfinityWallet);

    const icrcToken = BridgeIcrcToken.parse({
      icHost: 'http://localhost:9001',
      bftAddress: 'bftAddress',
      baseTokenCanisterId: 'baseTokenCanisterId',
      wrappedTokenAddress: 'wrappedTokenAddress',
      iCRC2MinterCanisterId: '1'
    });

    await connector.fetch([{ type: 'local', tokens: [icrcToken] }]);

    const bridgedCount = connector.bridge();
    expect(bridgedCount).toStrictEqual(1);

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
