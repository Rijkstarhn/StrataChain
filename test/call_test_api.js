const contractAddress = "0x86be6053E6e4Dd41F0Ed6a125CeF7ECDbEce8eEb";
let abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "Strata.StrataLotId",
          "name": "strataLotId",
          "type": "uint16"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "Strata.RequestId",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "RequestModified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "Strata.StrataLotId",
          "name": "strataLotId",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "StrataFeePaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "dayCount",
          "type": "uint256"
        }
      ],
      "name": "StrataFeesCollected",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "dailyStrataFeePerEntitlement",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "lastStrataFeeCollectedDate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "owners",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "autoApproveThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "autoRejectThreshold",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "ownedUnitsCount",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "requestIds",
      "outputs": [
        {
          "internalType": "Strata.RequestId",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "Strata.RequestId",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "requests",
      "outputs": [
        {
          "internalType": "enum Strata.RequestType",
          "name": "requestType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "enum Strata.RequestStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint16",
          "name": "approvalVoteCount",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "rejectionVoteCount",
          "type": "uint16"
        },
        {
          "internalType": "Strata.Date",
          "name": "voteDeadline",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "strataAccount",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "strataLotIds",
      "outputs": [
        {
          "internalType": "Strata.StrataLotId",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "totalEntitlement",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "Strata.StrataLotId",
          "name": "",
          "type": "uint16"
        }
      ],
      "name": "units",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "entitlement",
          "type": "uint16"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "autoApproveThreshold",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "autoRejectThreshold",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint16",
                  "name": "ownedUnitsCount",
                  "type": "uint16"
                }
              ],
              "internalType": "struct Strata.Owner",
              "name": "owner",
              "type": "tuple"
            },
            {
              "internalType": "Strata.Date",
              "name": "sinceDate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "paidStrataFees",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "paidExpenses",
              "type": "uint256"
            }
          ],
          "internalType": "struct Strata.Ownership",
          "name": "currentOwnership",
          "type": "tuple"
        },
        {
          "internalType": "int256",
          "name": "strataFeeBalance",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "strataLotCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "requestCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "Strata.StrataLotId",
          "name": "strataLotId",
          "type": "uint16"
        }
      ],
      "name": "payStrataFee",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "collectStrataFeePayments",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "daysBefore",
          "type": "uint8"
        }
      ],
      "name": "setLastStrataFeeCollectedDate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "requestWithdrawal",
      "outputs": [
        {
          "internalType": "Strata.Date",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "Strata.RequestId",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [
        {
          "internalType": "enum Strata.RequestStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "Strata.RequestId",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "supportsRequest",
          "type": "bool"
        }
      ],
      "name": "voteOnRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "setAutoApproveThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "setAutoRejectThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "Strata.StrataLotId",
          "name": "strataLotId",
          "type": "uint16"
        },
        {
          "internalType": "address",
          "name": "newOwnerAccount",
          "type": "address"
        }
      ],
      "name": "transferOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newTotalMonthlyStrataFee",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "requestStrataFeeChange",
      "outputs": [
        {
          "internalType": "Strata.Date",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newTotalMonthlyStrataFee",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "votingPeriod",
          "type": "uint256"
        }
      ],
      "name": "requestStrataFeeChange",
      "outputs": [
        {
          "internalType": "Strata.Date",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "Strata.RequestId",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "confirmStrataFeeChange",
      "outputs": [
        {
          "internalType": "enum Strata.RequestStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
contract("testing contract", accounts=>{
    it('set last strata fee collected date', async()=>{
        let strata = new web3.eth.Contract(abi, contractAddress);
        await strata.methods.setLastStrataFeeCollectedDate(7).send({from: accounts[0]});

        let lastStrataFeeCollectedDateNum = (await strata.methods.lastStrataFeeCollectedDate().call());
        console.log(`lastStrataFeeCollectedDateNum=${lastStrataFeeCollectedDateNum}`);

    })
});
