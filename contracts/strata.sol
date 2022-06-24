pragma solidity ^0.8.15;
//SPDX-License-Identifier: MIT

contract Strata{

    type StrataLotId is uint16;
    type ExpenseId is uint;
    type Date is uint;

    struct Unit{
        uint8 entitlement;
        Owner currentOwner;
    }

    struct Ownership{
        Date sinceDate;        
        Date untilDate;
        StrataLotId strataLotId;
    }

    struct Owner {
        string name;
        uint256 autoApproveThreshold;
        uint256 autoRejectThreshold;
        address account;
    }

    enum ExpenseStatus {Approved, Rejected, Pending}

    struct ExpenseItem{
        // uint expenseId;
        string description;
        uint256 amount;
        ExpenseStatus status;
        uint8 approvalVoteCount;
        uint8 rejectionVoteCount;
        Date voteDeadline;
    }

    struct StrataFeeItem{
        StrataLotId strataLotId;
        uint paymentDate;
        uint256 paymentAmount;
        address fromAccount;
    }

    mapping(StrataLotId=>Unit) public units; 
    mapping(uint=>Ownership) public ownerships;
    mapping(ExpenseId=>ExpenseItem) public expenses;

    address strataAccount;
    StrataFeeItem[] strataFeeSchedule;

    event VoteStarted(
        ExpenseId expenseId,
        string description,
        uint256 amount
    );

    constructor() {
        strataAccount = msg.sender;

        // initially assume all units are owned by strata corp, call transferOwner to change ownership
    }

    // request withdrawal - returns the deadline date of vote
    function requestWithdrawal(uint256 amount, string memory description) public returns (Date) {
        // create entry in expenses 

        // emit Vote event

        // return date of deadline
        return Date.wrap(0);
    }

    

    // vote
    function voteOnExpense(ExpenseId expenseId, bool yes, StrataLotId strataLotId, bytes memory signature) public {
        // validate signature

        // update vote in ExpenseItem
    }

    // get latest expense status
    function getLatestExpenseStatus(ExpenseId expenseId) public returns (ExpenseStatus) {
        require(msg.sender == strataAccount);

        // count votes

        // if status is not pending, return status

        // if now passes deadline, or yes > 50% or no > 50%
            // update status in ExpenseItem
            // return vote result 
        // return pending

        return ExpenseStatus.Pending;
    }

    // withdraw money from expense
    function withdraw(ExpenseId expenseId) public {
        // only strata corporation can withdraw
        require(msg.sender == strataAccount);

        if (getLatestExpenseStatus(expenseId) == ExpenseStatus.Approved) {
            // transfer expense amount out
        }
    }

    // collect strata fee from owner
    function payStrataFee(uint8 strataLotId) public payable {
        // verification
        
        // update balance

        // update strataFeeSchedule

    }

    // get units with overdued payments 
    function getOverdueStrataFees(uint date) public returns (uint8[] memory) {
        // return 
    }

    // check if the strata fee is paid as of date.
    function isStrataFeePaid(uint date, uint8 strataLotId)  public returns (bool) {
        
    }

    // refund unused strata fee as of date
    function refundUnusedStrataFee(StrataLotId strataLotId) private {

    }

    // owner transfer as of now
    function transferOwner(StrataLotId strataLotId, string memory newOwnerName, bytes memory newOwnerPublicKey) public {
        // only allow current owner to transfer ownership
        require(msg.sender == units[strataLotId].currentOwner.account);

        // add new owner to owners table if owner's public key does not exist
        // update ownerships table to reflect the ownership change for both existing owner and 
        // update units table to reflect the ownership change

        // refund unused strata fee to existing owner
    }
}