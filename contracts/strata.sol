pragma solidity ^0.8.15;
//SPDX-License-Identifier: MIT

//A libray that allows for some floating point math since Solidity does not support
//floating point numbers on its own. I've not really tested it, so not entirely sure we
//are using it right. But it will be important for calculations involving entitlement ratios.
import "https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMathQuad.sol";

contract Strata {

    //TODO: Was reading into it a bit and it turns out storing data is expensive.
    //It might be worth seeing if we can keep an eye on that. It could be a good topic for
    //our results section of the report to talk about this and ways to reduce the cost.
    //Being clever about how data is packed and not unnecessarily using mappings is one strategy.
    //Possibly storing data off-chain may be another. For now though, let's prioritize getting the contract working.

    //Timestamps are stored in unix time which is measured in seconds.
    //Simply add this to a date to offset the date by a week.
    uint32 constant weekInSeconds = 7 * 24 * 60 * 60;

    type StrataLotId is uint16;
    type ExpenseId is uint;
    type Date is uint;

    struct Unit {
        uint16 entitlement;
        Ownership currentOwnership;
        int256 strataFeeBalance;
    }

    struct Ownership {
        Owner owner;
        Date sinceDate;        
        // StrataLotId strataLotId;
        uint256 paidStrataFees;
        uint256 paidExpenses;
    }

    struct Owner {
        uint256 autoApproveThreshold;
        uint256 autoRejectThreshold;
        address account;
    }

    enum ExpenseStatus {
        Approved,
        Rejected,
        Pending
    }

    struct ExpenseItem {
        string description;
        uint256 amount;
        ExpenseStatus status;
        uint8 approvalVoteCount;
        uint8 rejectionVoteCount;
        Date voteDeadline;
    }

    event VoteStarted(
        ExpenseId expenseId
    );

    //TODO: Apparently with a mapping, every key-value pair exists with values defaulting to zero-initialized values.
    //Because of this, we need to be careful about what assumptions we are making when we want to check if an
    //item exists in the map. For this, we'd basically need to check some portion of the value struct to see if it is valid or not

    mapping(StrataLotId => Unit) public units; 
    mapping(address => Owner) public owners;
    mapping(ExpenseId => ExpenseItem) public expenses;
    mapping(ExpenseId => mapping(StrataLotId => bool)) expenseVoters;

    //This is necessary because apparently you cannot directly iterate through entries in a mapping.
    StrataLotId[] public strataLotIds;

    address public strataAccount;
    uint256 public totalMonthlyStrataFee;
    uint16 totalEntitlement;

    uint expenseIdCounter;
    constructor() {
        strataAccount = msg.sender;
        totalMonthlyStrataFee = 1000;

        totalEntitlement = 600;

        expenseIdCounter = 0;

        // initially assume all units are owned by strata corp, call transferOwner to change ownership

        Owner memory defaultOwner = Owner({
            account: strataAccount,
            autoApproveThreshold: 0,
            autoRejectThreshold: 2**256 - 1
        });

        units[StrataLotId.wrap(1)] = Unit({
            entitlement: 100,
            currentOwnership: Ownership({
                owner: defaultOwner,
                sinceDate: Date.wrap(block.timestamp),
                paidStrataFees: 0,
                paidExpenses: 0
            }),
            strataFeeBalance: 0
        });

        units[StrataLotId.wrap(2)] = Unit({
            entitlement: 200,
            currentOwnership: Ownership({
                owner: defaultOwner,
                sinceDate: Date.wrap(block.timestamp),
                paidStrataFees: 0,
                paidExpenses: 0
            }),
            strataFeeBalance: 0
        });

        units[StrataLotId.wrap(3)] = Unit({
            entitlement: 300,
            currentOwnership: Ownership({
                owner: defaultOwner,
                sinceDate: Date.wrap(block.timestamp),
                paidStrataFees: 0,
                paidExpenses: 0
            }),
            strataFeeBalance: 0
        });

        strataLotIds.push(StrataLotId.wrap(1));
        strataLotIds.push(StrataLotId.wrap(2));
        strataLotIds.push(StrataLotId.wrap(3));


        owners[strataAccount] = defaultOwner;
    }

    // collect strata fee from owner
    function payStrataFee(StrataLotId strataLotId) public payable {
        verifySenderIsOwnerOfStrataLot(strataLotId);
        
        payable(address(this)).transfer(msg.value);

        units[strataLotId].strataFeeBalance -= int256(msg.value);
    }

    function collectStrataFeePayments() public {
        verifySenderIsStrataCorporation();

        for (uint i; i < strataLotIds.length; ++i) {
            StrataLotId strataLotId = strataLotIds[i];

            uint256 balanceToAdd = multiplyByEntitlementRatio(strataLotId, totalMonthlyStrataFee);
            
            units[strataLotId].strataFeeBalance += int256(balanceToAdd);
        }
    }

    // request withdrawal - returns the deadline date of vote
    function requestWithdrawal(uint256 amount, string memory description) public returns (Date) {
        verifySenderIsStrataCorporation();

        // create entry in expenses 
        ExpenseItem memory expenseItem = ExpenseItem({
            description: description,
            amount: amount,
            status: ExpenseStatus.Pending,
            approvalVoteCount: 0,
            rejectionVoteCount: 0,
            voteDeadline: Date.wrap(block.timestamp + weekInSeconds)
        });

        ExpenseId expenseId = ExpenseId.wrap(expenseIdCounter++);
        expenses[expenseId] = expenseItem;

        // emit Vote event
        emit VoteStarted(expenseId);

        for (uint i = 0; i < strataLotIds.length; ++i) {
            StrataLotId strataLotId = strataLotIds[i];

            Owner memory owner = units[strataLotId].currentOwnership.owner;

            //TODO: Re-evaluate where it makes most sense to tally up auto votes.
            //Doing it at the creation of an expense is nice and simple though,
            //but it requires the auto thresholds to be set prior to start of a vote
            //and based on the tracking of voters, once an auto vote is entered,
            //the vote cannot be switched

            if (expenseItem.amount < owner.autoApproveThreshold) {
                ++expenseItem.approvalVoteCount;
                expenseVoters[expenseId][strataLotId] = true;
            }
            else if (expenseItem.amount > owner.autoRejectThreshold) {
                ++expenseItem.rejectionVoteCount;
                expenseVoters[expenseId][strataLotId] = true;
            }

        }

        // return date of deadline
        return expenseItem.voteDeadline;
    }

    // withdraw money from expense
    function withdraw(ExpenseId expenseId) public returns (ExpenseStatus) {
        verifySenderIsStrataCorporation();

        ExpenseItem memory expenseItem = expenses[expenseId];

        //If more than half of all units approved, so end vote early
        if (expenseItem.approvalVoteCount >= strataLotIds.length) {
            delete expenses[expenseId];
            payable(strataAccount).transfer(expenseItem.amount);
            return ExpenseStatus.Approved;
        }

        //If more than half of all units rejected, so end vote early
        if (expenseItem.rejectionVoteCount > strataLotIds.length) {
            delete expenses[expenseId];
            return ExpenseStatus.Rejected;
        }

        //If vote is not over
        if (block.timestamp < Date.unwrap(expenseItem.voteDeadline)) {
            return ExpenseStatus.Pending;
        }

        //Vote is now over, so delete the expense
        delete expenses[expenseId];

        //If more voters approved than rejected, then approve the expense
        if (expenseItem.approvalVoteCount >= expenseItem.rejectionVoteCount) {
            payable(strataAccount).transfer(expenseItem.amount);
            return ExpenseStatus.Approved;
        }

        return ExpenseStatus.Rejected;
    }

    // vote
    function voteOnExpense(ExpenseId expenseId, bool supportsExpense, StrataLotId strataLotId) public {
        verifySenderIsOwnerOfStrataLot(strataLotId);
        require(expenseVoters[expenseId][strataLotId] == false);

        ExpenseItem memory expenseItem = expenses[expenseId];
        
        if (supportsExpense) {
            ++expenseItem.approvalVoteCount;
        }
        else {
            ++expenseItem.rejectionVoteCount;
        }

        expenseVoters[expenseId][strataLotId] = true;
    }

    function setAutoApproveThreshold(uint256 amount) public {
        verifySenderIsOwner();

        owners[msg.sender].autoApproveThreshold = amount;
    }

    function setAutoRejectThreshold(uint256 amount) public {
        verifySenderIsOwner();

        owners[msg.sender].autoRejectThreshold = amount;
    }

    // owner transfer as of now
    function transferOwner(StrataLotId strataLotId, address newOwnerAccount) public {
        verifySenderIsOwnerOfStrataLot(strataLotId);
        require(newOwnerAccount != address(0));

        refundUnusedStrataFee(strataLotId);

        Owner memory newOwner = owners[newOwnerAccount];
        if (newOwner.account == address(0)) {
            newOwner = Owner({
                account: newOwnerAccount,
                autoApproveThreshold: 0,
                autoRejectThreshold: 2**256 - 1
            });
        }

        units[StrataLotId.wrap(3)] = Unit({
            entitlement: 300,
            currentOwnership: Ownership({
                owner: newOwner,
                sinceDate: Date.wrap(block.timestamp),
                paidStrataFees: 0,
                paidExpenses: 0
            }),
            strataFeeBalance: 0
        });

        owners[newOwnerAccount] = newOwner;
    }

    // refund unused strata fee as of date
    function refundUnusedStrataFee(StrataLotId strataLotId) private {
        Ownership memory ownership = units[strataLotId].currentOwnership;
        int256 refundAmount = int256(ownership.paidStrataFees - ownership.paidExpenses);

        if (refundAmount < 0) {
            refundAmount = 0;
        }
        payable(ownership.owner.account).transfer(uint256(refundAmount));
    }

    function multiplyByEntitlementRatio(StrataLotId strataLotId, uint256 amount) private view returns (uint256) {
        //Type conversions are supposedly expensive on gas.
        //We might wish to keep everything as floating point numbers as much as possible
        return ABDKMathQuad.toUInt(
            ABDKMathQuad.mul(
                ABDKMathQuad.div(
                    ABDKMathQuad.fromUInt(units[strataLotId].entitlement),
                    ABDKMathQuad.fromUInt(totalEntitlement)),
                ABDKMathQuad.fromUInt(amount)));
    }

    //Verify that the sender of a message is the strata corporation
    function verifySenderIsStrataCorporation() private view {
        require(msg.sender == strataAccount);
    }

    //Verify that the sender of a message is an owner tracked by this contract
    function verifySenderIsOwner() private view {
        require(owners[msg.sender].account == msg.sender);
    }

    //Verify that the sender of a message is the owner of a particular strata lot
    function verifySenderIsOwnerOfStrataLot(StrataLotId strataLotId) private view {
        require(units[strataLotId].currentOwnership.owner.account == msg.sender);
    }
}