import { describe, test, expect } from 'vitest';

import { BridgeToken, idStrMatch } from '../tokens';
import { id as idBridged } from '../tokens';
import { FetchedToken, id as idFetched } from '../tokens-fetched';

const tokensBridged: BridgeToken[] = [
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'btc',
    wrappedTokenAddress: '0x63d2ad3ac563672018a81bdda710aaccf9dd88ca',
    btcBridgeCanisterId: 'by6od-j4aaa-aaaaa-qaadq-cai'
  },
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'icrc',
    baseTokenCanisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
    iCRC2MinterCanisterId: 'br5f7-7uaaa-aaaaa-qaaca-cai',
    wrappedTokenAddress: '0x4E5E17B059676d006Ddfb46fc59B842d793F85EF'
  },
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'rune',
    runeId: '113:1',
    runeBridgeCanisterId: 'br5f7-7uaaa-aaaaa-qaaca-cai',
    wrappedTokenAddress: '0x86F972890e1520894Fb2432D2CdE7Fe0b3967fdb'
  }
];

const tokensFetched: FetchedToken[] = [
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'btc',
    wrappedTokenAddress: '0x63d2ad3ac563672018a81bdda710aaccf9dd88ca',
    btcBridgeCanisterId: 'by6od-j4aaa-aaaaa-qaadq-cai'
  },
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'icrc',
    name: 'AUX',
    symbol: 'AUX',
    baseTokenCanisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
    iCRC2MinterCanisterId: 'br5f7-7uaaa-aaaaa-qaaca-cai'
  },
  {
    bftAddress: '0x9ff6306da2d7ab2a43cbde414ee95d52a05a656b',
    type: 'rune',
    runeId: '113:1',
    runeBridgeCanisterId: 'br5f7-7uaaa-aaaaa-qaaca-cai',
    name: 'RUNERUNERUNERUNE'
  }
];

describe.sequential('ids', () => {
  test('bridged', () => {
    expect(idBridged(tokensBridged[0])).toStrictEqual(
      '0x63d2ad3ac563672018a81bdda710aaccf9dd88ca'
    );
    expect(idBridged(tokensBridged[1])).toStrictEqual(
      '0x4e5e17b059676d006ddfb46fc59b842d793f85ef_bkyz2fmaaaaaaaaqaaaqcai'
    );
    expect(idBridged(tokensBridged[2])).toStrictEqual(
      '0x86f972890e1520894fb2432d2cde7fe0b3967fdb_113:1'
    );
  });

  test('fetched', () => {
    expect(idFetched(tokensFetched[0])).toStrictEqual(
      '0x63d2ad3ac563672018a81bdda710aaccf9dd88ca'
    );
    expect(idFetched(tokensFetched[1])).toStrictEqual(
      'bkyz2fmaaaaaaaaqaaaqcai'
    );
    expect(idFetched(tokensFetched[2])).toStrictEqual('113:1');
  });

  test('matching', () => {
    expect(
      idStrMatch(idFetched(tokensFetched[0]), tokensBridged[0])
    ).toBeTruthy();
    expect(
      idStrMatch(idFetched(tokensFetched[0]), tokensBridged[1])
    ).toBeFalsy();
    expect(
      idStrMatch(idFetched(tokensFetched[0]), tokensBridged[2])
    ).toBeFalsy();

    expect(
      idStrMatch(idFetched(tokensFetched[1]), tokensBridged[0])
    ).toBeFalsy();
    expect(
      idStrMatch(idFetched(tokensFetched[1]), tokensBridged[1])
    ).toBeTruthy();
    expect(
      idStrMatch(idFetched(tokensFetched[1]), tokensBridged[2])
    ).toBeFalsy();

    expect(
      idStrMatch(idFetched(tokensFetched[2]), tokensBridged[0])
    ).toBeFalsy();
    expect(
      idStrMatch(idFetched(tokensFetched[2]), tokensBridged[1])
    ).toBeFalsy();
    expect(
      idStrMatch(idFetched(tokensFetched[2]), tokensBridged[2])
    ).toBeTruthy();
  });
});
