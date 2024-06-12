const abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'minterAddress', type: 'address', internalType: 'address' },
      { name: 'feeChargeAddress', type: 'address', internalType: 'address' },
      { name: '_isWrappedSide', type: 'bool', internalType: 'bool' }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'burn',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'fromERC20', type: 'address', internalType: 'address' },
      { name: 'recipientID', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: '', type: 'uint32', internalType: 'uint32' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'deployERC20',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'symbol', type: 'string', internalType: 'string' },
      { name: 'baseTokenID', type: 'bytes32', internalType: 'bytes32' }
    ],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'feeChargeContract',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract IFeeCharge' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getBaseToken',
    inputs: [
      { name: 'wrappedTokenAddress', type: 'address', internalType: 'address' }
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getDepositBlocks',
    inputs: [],
    outputs: [
      { name: 'blockNumbers', type: 'uint32[]', internalType: 'uint32[]' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getMinterAddress',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getWrappedToken',
    inputs: [{ name: 'baseTokenID', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'listTokenPairs',
    inputs: [],
    outputs: [
      { name: 'wrapped', type: 'address[]', internalType: 'address[]' },
      { name: 'base', type: 'bytes32[]', internalType: 'bytes32[]' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'encodedOrder', type: 'bytes', internalType: 'bytes' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'minterCanisterAddress',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'notifyMinter',
    inputs: [
      { name: 'notificationType', type: 'uint32', internalType: 'uint32' },
      { name: 'userData', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'operationIDCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint32', internalType: 'uint32' }],
    stateMutability: 'view'
  },
  {
    type: 'event',
    name: 'BurnTokenEvent',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      {
        name: 'fromERC20',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'recipientID',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes'
      },
      {
        name: 'toToken',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'operationID',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32'
      },
      {
        name: 'name',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'symbol',
        type: 'bytes16',
        indexed: false,
        internalType: 'bytes16'
      },
      { name: 'decimals', type: 'uint8', indexed: false, internalType: 'uint8' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'MintTokenEvent',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256'
      },
      {
        name: 'fromToken',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'senderID',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'toERC20',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: false,
        internalType: 'address'
      },
      { name: 'nonce', type: 'uint32', indexed: false, internalType: 'uint32' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'NotifyMinterEvent',
    inputs: [
      {
        name: 'notificationType',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32'
      },
      { name: 'userData', type: 'bytes', indexed: false, internalType: 'bytes' }
    ],
    anonymous: false
  },
  {
    type: 'event',
    name: 'WrappedTokenDeployedEvent',
    inputs: [
      { name: 'name', type: 'string', indexed: false, internalType: 'string' },
      {
        name: 'symbol',
        type: 'string',
        indexed: false,
        internalType: 'string'
      },
      {
        name: 'baseTokenID',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32'
      },
      {
        name: 'wrappedERC20',
        type: 'address',
        indexed: false,
        internalType: 'address'
      }
    ],
    anonymous: false
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [{ name: 'target', type: 'address', internalType: 'address' }]
  },
  {
    type: 'error',
    name: 'AddressInsufficientBalance',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }]
  },
  { type: 'error', name: 'ECDSAInvalidSignature', inputs: [] },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureLength',
    inputs: [{ name: 'length', type: 'uint256', internalType: 'uint256' }]
  },
  {
    type: 'error',
    name: 'ECDSAInvalidSignatureS',
    inputs: [{ name: 's', type: 'bytes32', internalType: 'bytes32' }]
  },
  { type: 'error', name: 'FailedInnerCall', inputs: [] },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }]
  }
];

export default abi;
