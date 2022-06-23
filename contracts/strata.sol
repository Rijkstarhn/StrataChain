pragma solidity ^0.8.7;
//SPDX-License-Identifier: MIT

contract Strata{
    struct Unit{
        uint8 entitlement;
        Owner currentOwner;
    }

    struct Ownership{
        bytes ownerPublicKey;
        uint sinceDate;        
        uint untilDate;
        uint8 strataLotIdOwned;
    }

    struct Owner {
        string name;
        bytes publicKey;
        uint256 maxAutoY;
        uint256 minAutoN;
        address addr;
    }

    enum ExpenseStatus {Approved, Rejected, Pending}

    struct ExpenseItem{
        // uint expenseId;
        string description;
        uint256 amount;
        ExpenseStatus status;
        uint8 yesVote;
        uint8 noVote;
        uint voteDeadlineDate;
    }

    struct StrataFeeItem{
        uint8 strataLotId;
        uint paymentDate;
        uint256 paymentAmount;
        address fromAddress;
    }

    mapping(uint8=>Unit) public units; 
    mapping(address=>Owner) public owners;
    mapping(uint=>Ownership) public ownerships;
    mapping(uint=>ExpenseItem) public expenses;

    uint256 balance;
    address strataAccount;
    StrataFeeItem[] strataFeeSchedule;

    event Vote(
        uint expenseId,
        string description,
        uint256 amount
    );

    constructor(){
        strataAccount = msg.sender;

        // initially assume all units are owned by strata corp, call transferOwner to change ownership
    }

    // request withdrawal - returns the deadline date of vote
    function requestWithdrawal(uint256 amount, string memory description) public returns (uint) {
        // create entry in expenses 

        // emit Vote event

        // return date of deadline
        return 0;
    }

    

    // vote
    function vote(uint expenseId, bool yes, uint strataLotId, bytes memory signature) public {
        // validate signature

        // update vote in ExpenseItem
    }

    // get latest expense status
    function latestExpenseStatus (uint expenseId) public returns (ExpenseStatus) {
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
    function withdraw(uint expenseId) public {
        // only strata corporation can withdraw
        require(msg.sender == strataAccount);

        if (latestExpenseStatus(expenseId) == ExpenseStatus.Approved) {
            // transfer expense amount out
        }
    }

    // collect strata fee from owner
    function payStrataFee(uint8 strataLotId) public payable{
        // verification
        
        // update balance
        balance += msg.value;

        // update strataFeeSchedule

    }

    // get units with overdued payments 
    function strataFeeOverdued(uint date) public returns (uint8[] memory) {
        // return 
    }

    // check if the strata fee is paid as of date.
    function isStrataFeePaid(uint date, uint8 strataLotId)  public returns (bool) {
        
    }

    // refund unused strata fee as of date
    function refundUnusedStrataFee(uint8 strataLotId, uint date) private {

    }

    // owner transfer as of now
    function transferOwner(uint8 strataLotId, string memory newOwnerName, bytes memory newOwnerPublicKey) public {
        // only allow current owner to transfer ownership
        require(msg.sender == units[strataLotId].currentOwner.addr);

        // add new owner to owners table if owner's public key does not exist
        // update ownerships table to reflect the ownership change for both existing owner and 
        // update units table to reflect the ownership change

        // refund unused strata fee to existing owner
    }
}