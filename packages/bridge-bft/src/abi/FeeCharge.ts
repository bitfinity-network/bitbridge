export const abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'canChargeFee', type: 'address[]', internalType: 'address[]' }
    ],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'chargeFee',
    inputs: [
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'to', type: 'address', internalType: 'address payable' },
      { name: 'senderID', type: 'bytes32', internalType: 'bytes32' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'nativeTokenBalance',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'nativeTokenDeposit',
    inputs: [
      {
        name: 'approvedSenderIDs',
        type: 'bytes32[]',
        internalType: 'bytes32[]'
      }
    ],
    outputs: [{ name: 'balance', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'nativeTokenWithdraw',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: 'balance', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'removeApprovedSenderIDs',
    inputs: [
      {
        name: 'approvedSenderIDs',
        type: 'bytes32[]',
        internalType: 'bytes32[]'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
];

export default abi;
