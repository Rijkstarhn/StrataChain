pragma solidity ^0.8.15;
//SPDX-License-Identifier: MIT

contract Strata {

    //TODO: Was reading into it a bit and it turns out storing data is expensive.
    //It might be worth seeing if we can keep an eye on that. It could be a good topic for
    //our results section of the report to talk about this and ways to reduce the cost.
    //Being clever about how data is packed and not unnecessarily using mappings is one strategy.
    //Possibly storing data off-chain may be another. For now though, let's prioritize getting the contract working.

    /// TYPES

    type StrataLotId is uint16;
    type RequestId is uint32;
    type Date is uint48;

    struct Unit {
        uint16 entitlement;
        Ownership currentOwnership;
        int256 strataFeeBalance;
    }

    struct Ownership {
        address ownerAccount;
        Date sinceDate;        
        uint256 paidStrataFees;
        uint256 paidExpenses;
    }

    struct Owner {
        uint8 ownedUnitsCount;
        uint256 autoApproveThreshold;
        uint256 autoRejectThreshold;
    }

    enum RequestStatus {
        Approved,
        Rejected,
        Pending,
        Completed
    }

    enum RequestType {
        Expense,
        FeeChange
    }

    struct RequestItem {
        RequestType requestType;
        string description;
        RequestStatus status;
        uint16 approvalVoteCount;
        uint16 rejectionVoteCount;
        Date voteDeadline;
        uint256 amount;
    }

    /// EVENTS
    event RequestModified(
        RequestId requestId
    );

    event StrataFeePaid(
        StrataLotId strataLotId,
        uint256 amount
    );

    event OwnershipTransferred(
        StrataLotId strataLotId
    );

    event StrataFeesCollected(
        Date date,
        uint dayCount
    );
    event UnsettledStrataFee(
        address owner,
        StrataLotId strataLotId,
        Date date,
        uint256 amount
    );
    event StrataFeeRefunded(
        address owner,
        StrataLotId strataLotId,
        Date date,
        uint256 amount
    );
    //TODO: Apparently with a mapping, every key-value pair exists with values defaulting to zero-initialized values.
    //Because of this, we need to be careful about what assumptions we are making when we want to check if an
    //item exists in the map. For this, we'd basically need to check some portion of the value struct to see if it is valid or not
    
    /// VARIABLES
    uint16 public totalEntitlement;
    uint16 public strataLotCount;
    uint32 public requestCount;

    address public strataAccount;
    
    uint256 public dailyStrataFeePerEntitlement;
    Date public lastStrataFeeCollectedDate;

    mapping(StrataLotId => Unit) public units; 
    mapping(address => Owner) public owners;
    mapping(RequestId => RequestItem) public requests;
    mapping(RequestId => mapping(StrataLotId => bool)) private requestVoters;

    function createUnit(uint16 entitlement, address ownerAccount) private
    {
        units[StrataLotId.wrap(strataLotCount++)] = Unit({
            entitlement: entitlement,
            strataFeeBalance: 0,
            currentOwnership: Ownership({
                ownerAccount: ownerAccount,
                sinceDate: Date.wrap(uint48(block.timestamp - 365 days)),
                paidStrataFees: 0,
                paidExpenses: 0
            })
        });
    }
    function createUnit(uint16 entitlement, address ownerAccount, Date sinceDate) private
    {
        units[StrataLotId.wrap(strataLotCount++)] = Unit({
            entitlement: entitlement,
            strataFeeBalance: 0,
            currentOwnership: Ownership({
                ownerAccount: ownerAccount,
                sinceDate: sinceDate,
                paidStrataFees: 0,
                paidExpenses: 0
            })
        });
    }
    
    constructor() {
        strataAccount = msg.sender;
        dailyStrataFeePerEntitlement = 79039 gwei;
        lastStrataFeeCollectedDate = Date.wrap(uint48(block.timestamp / 1 days));
        totalEntitlement = 7077;

        requestCount = 0;
        strataLotCount = 0;

        // initially assume all units are owned by strata corp, call transferOwner to change ownership

        createUnit(93, strataAccount, Date.wrap(uint48(block.timestamp - 1 days)));
        createUnit(119, strataAccount);
        createUnit(115, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);

        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);

        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);
        createUnit(122, strataAccount);

        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);

        createUnit(93, strataAccount);
        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);

        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);

        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);

        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);

        createUnit(93, strataAccount);
        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);

        createUnit(119, strataAccount);
        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(93, strataAccount);
        createUnit(119, strataAccount);

        createUnit(122, strataAccount);
        createUnit(108, strataAccount);
        createUnit(210, strataAccount);
        createUnit(232, strataAccount);
        createUnit(210, strataAccount);

        createUnit(232, strataAccount);
        createUnit(216, strataAccount);
        createUnit(238, strataAccount);

        owners[strataAccount] = Owner({
            autoApproveThreshold: 0,
            autoRejectThreshold: 2**256 - 1,
            ownedUnitsCount: 58
        });
    }

    // collect strata fee from owner
    function payStrataFee(StrataLotId strataLotId) public payable {
        verifySenderIsOwnerOfStrataLot(strataLotId);
        
        units[strataLotId].strataFeeBalance -= int256(msg.value);

        emit StrataFeePaid(strataLotId, msg.value);
    }

    function collectStrataFeePayments() public {
        verifySenderIsStrataCorporation();
        
        for (uint16 i = 0; i <= strataLotCount; ++i) {
            StrataLotId strataLotId = StrataLotId.wrap(i);
            collectStrataFeePayment(strataLotId);
        }
        Date date = Date.wrap(uint48(block.timestamp / 1 days));
        emit StrataFeesCollected(date, Date.unwrap(date) - Date.unwrap(lastStrataFeeCollectedDate));
        lastStrataFeeCollectedDate = date;
    }

    // TODO: this is just for testing
    function setLastStrataFeeCollectedDate(uint8 daysBefore) public {
       lastStrataFeeCollectedDate = Date.wrap( uint48((block.timestamp / 1 days) - daysBefore));
    }

    // request withdrawal - returns the deadline date of vote
    function requestWithdrawal(uint256 amount, string memory description) public returns (Date) {
        verifySenderIsStrataCorporation();

        // create entry in expenses 
        RequestItem memory requestItem = RequestItem({
            requestType: RequestType.Expense,
            description: description,
            amount: amount,
            status: RequestStatus.Pending,
            approvalVoteCount: 0,
            rejectionVoteCount: 0,
            voteDeadline: Date.wrap(uint48(block.timestamp) + 1 minutes)
        });

        RequestId requestId = RequestId.wrap(requestCount++);

        for (uint16 i = 0; i < strataLotCount; ++i) {
            StrataLotId strataLotId = StrataLotId.wrap(i);

            Owner memory owner = owners[units[strataLotId].currentOwnership.ownerAccount];

            //TODO: Re-evaluate where it makes most sense to tally up auto votes.
            //Doing it at the creation of an expense is nice and simple though,
            //but it requires the auto thresholds to be set prior to start of a vote
            //and based on the tracking of voters, once an auto vote is entered,
            //the vote cannot be switched

            if (requestItem.amount < owner.autoApproveThreshold) {
                ++requestItem.approvalVoteCount;
                requestVoters[requestId][strataLotId] = true;
            }
            else if (requestItem.amount > owner.autoRejectThreshold) {
                ++requestItem.rejectionVoteCount;
                requestVoters[requestId][strataLotId] = true;
            }

        }

        RequestStatus status = voteResult(requestItem);
        requestItem.status = status;

        //If request status became approved, then perform a withdrawal or fee change confirmation
        if (status == RequestStatus.Approved){
            if (address(this).balance >= requestItem.amount) {
                performWithdraw(requestItem);
            }
        }

        requests[requestId] = requestItem;

        // emit Vote event
        emit RequestModified(requestId);

        // return date of deadline
        return requestItem.voteDeadline;
    }

    // withdraw money from expense
    function withdraw(RequestId requestId) public returns (RequestStatus) {
        RequestItem memory request = requests[requestId];

        require(request.status == RequestStatus.Approved);
        require(request.requestType == RequestType.Expense);
        require(address(this).balance >= request.amount);
        
        if (request.status == RequestStatus.Approved) {
            performWithdraw(request);
            requests[requestId] = request;
        }
        return request.status;
    }

    function performWithdraw(RequestItem memory request) private {
        payable(strataAccount).transfer(request.amount);
        request.status = RequestStatus.Completed;
    }
    // vote
    function voteOnRequest(RequestId requestId, bool supportsRequest, StrataLotId[] calldata strataIds) external returns (RequestStatus) {
        require(owners[msg.sender].ownedUnitsCount > 0);
        // Validate that every passed in lot ID is one that the sender owns. 
        // If it is not we can either reject the entire message or just ignore the ones you don't own

        RequestItem memory request = requests[requestId];

        uint16 voteCount = uint16(strataIds.length);
        for (uint16 i = 0; i < strataIds.length; ++i) {
            StrataLotId strataLotId = strataIds[i];
            if (units[strataLotId].currentOwnership.ownerAccount != msg.sender || requestVoters[requestId][strataLotId]) {
                --voteCount;
            }
            else {
                requestVoters[requestId][strataLotId] = true;
            }
        }

        if (supportsRequest) {
            request.approvalVoteCount += voteCount;
        }
        else {
            request.rejectionVoteCount += voteCount;
        }

        // Update request status
        RequestStatus status = voteResult(request);
        request.status = status;

        //If request status became approved, then perform a withdrawal or fee change confirmation
        if (status == RequestStatus.Approved){
            if (request.requestType == RequestType.Expense && address(this).balance >= request.amount) {
                performWithdraw(request);
            }
            else if (request.requestType == RequestType.FeeChange) {
                performConfirmStrataFeeChange(request);
            }
        }

        requests[requestId] = request;
        emit RequestModified(requestId);
        return status;
    }

    function setAutoApproveThreshold(uint256 amount) public {
        verifySenderIsOwner();
        require(amount < owners[msg.sender].autoRejectThreshold);
        owners[msg.sender].autoApproveThreshold = amount;
    }

    function setAutoRejectThreshold(uint256 amount) public {
        verifySenderIsOwner();
        require(amount > owners[msg.sender].autoApproveThreshold);
        owners[msg.sender].autoRejectThreshold = amount;
    }

    // owner transfer as of now
    function transferOwner(StrataLotId strataLotId, address newOwnerAccount) public {
        verifySenderIsOwnerOfStrataLot(strataLotId);

        refundUnusedStrataFee(strataLotId);

        Owner memory newOwner = owners[newOwnerAccount];
        if (newOwner.ownedUnitsCount == 0) {
            newOwner = Owner({
                autoApproveThreshold: 0,
                autoRejectThreshold: 2**256 - 1,
                ownedUnitsCount: 0
            });
        }

        Unit memory unit = units[strataLotId];
        unit.currentOwnership = Ownership({
                ownerAccount: newOwnerAccount,
                sinceDate: Date.wrap(uint48(block.timestamp)),
                paidStrataFees: 0,
                paidExpenses: 0
            });
        unit.strataFeeBalance = 0;
        units[strataLotId] = unit;

        Owner memory oldOwner = owners[msg.sender];
        --oldOwner.ownedUnitsCount;
        if (oldOwner.ownedUnitsCount == 0) {
            delete owners[msg.sender];
        }

        ++newOwner.ownedUnitsCount;
        owners[newOwnerAccount] = newOwner;

        emit OwnershipTransferred(strataLotId);
    }
    
    function collectStrataFeePayment(StrataLotId strataLotId) private returns (int256, address){
        Unit memory unit = units[strataLotId];
        Ownership memory ownership = unit.currentOwnership;

        // since owner owns the strata or last date of collection, whichever is later
        uint dayCount ;
        uint sinceDate = Date.unwrap(ownership.sinceDate) / 1 days;
        uint lastCollected = Date.unwrap(lastStrataFeeCollectedDate);
        if ( sinceDate > lastCollected){
            dayCount = (block.timestamp / 1 days)- sinceDate;
        } else {
            dayCount = (block.timestamp / 1 days)- lastCollected;
        }

        uint256 balanceToAdd = unit.entitlement * dailyStrataFeePerEntitlement * dayCount;
            
        unit.strataFeeBalance += int256(balanceToAdd);

        units[strataLotId] = unit;

        return (unit.strataFeeBalance, ownership.ownerAccount);
    }
    

    


    // refund unused strata fee as of date
    function refundUnusedStrataFee(StrataLotId strataLotId) private {
        // first collect strata fee up to date
        int256 finalbalance;
        address ownerAddr;
        (finalbalance,  ownerAddr) = collectStrataFeePayment(strataLotId);

        // if there is a balance, refund
        if (finalbalance < 0) {
            // refund
            payable(ownerAddr).transfer(uint256(-finalbalance));
            emit StrataFeeRefunded(ownerAddr, strataLotId, Date.wrap(uint48(block.timestamp / 1 days)), uint256(-finalbalance));
        } else if (finalbalance > 0) {
            emit UnsettledStrataFee(ownerAddr, strataLotId, Date.wrap(uint48(block.timestamp / 1 days)), uint256(finalbalance));
        }
    }

    //Verify that the sender of a message is the strata corporation
    function verifySenderIsStrataCorporation() private view {
        require(msg.sender == strataAccount);
    }

    //Verify that the sender of a message is an owner tracked by this contract
    function verifySenderIsOwner() private view {
        require(owners[msg.sender].ownedUnitsCount > 0);
    }

    //Verify that the sender of a message is the owner of a particular strata lot
    function verifySenderIsOwnerOfStrataLot(StrataLotId strataLotId) private view {
        require(units[strataLotId].currentOwnership.ownerAccount == msg.sender);
    }

    //request strata fee change
    function requestStrataFeeChange(uint newTotalMonthlyStrataFee, string memory reason) public returns (Date) {
        return requestStrataFeeChange(newTotalMonthlyStrataFee, reason, 7 days);
    }

    function requestStrataFeeChange(uint newTotalMonthlyStrataFee, string memory reason, uint48 votingPeriod) public returns (Date) {
        // verify sender is strata corp
        verifySenderIsStrataCorporation();

        // create a reqeust
        RequestId requestId = RequestId.wrap(requestCount++);
        requests[requestId] = RequestItem({
            requestType: RequestType.FeeChange,
            description: reason, 
            amount: newTotalMonthlyStrataFee,
            status: RequestStatus.Pending,
            approvalVoteCount: 0,
            rejectionVoteCount: 0,
            voteDeadline: Date.wrap(uint48(block.timestamp) + votingPeriod)
        });

        // emit an event
        emit RequestModified(requestId);

        // return the deadline [TODO: may truncate the time portion?]
        return Date.wrap(uint48(block.timestamp) + votingPeriod);
    }

    // confirm strata fee change - effective immediately
    function confirmStrataFeeChange(RequestId requestId) public returns (RequestStatus) {
        RequestItem memory request = requests[requestId];

        require(request.status == RequestStatus.Approved);
        require(request.requestType == RequestType.FeeChange);
        
        if (request.status == RequestStatus.Approved) {
            performConfirmStrataFeeChange(request);
        }
        return request.status;
    }

    function performConfirmStrataFeeChange(RequestItem memory request) private {
        dailyStrataFeePerEntitlement = request.amount;
        request.status = RequestStatus.Completed;
    }

    function voteResult(RequestItem memory requestItem) private view returns (RequestStatus){
        uint majority = uint(strataLotCount >> 1) + 1;

        //If more than half of all units approved, so end vote early
        if (requestItem.approvalVoteCount >= majority) {
            // delete requests[requestId];
            return RequestStatus.Approved;
        }

        //If more than half of all units rejected, so end vote early
        if (requestItem.rejectionVoteCount > strataLotCount - majority) {
            // delete requests[requestId];
            return RequestStatus.Rejected;
        }

        //If vote is not over
        if (block.timestamp < Date.unwrap(requestItem.voteDeadline)) {
            return RequestStatus.Pending;
        }

        //Vote is now over, so delete the expense
        // delete requests[requestId];

        //If more voters approved than rejected, then approve the expense
        if (requestItem.approvalVoteCount > requestItem.rejectionVoteCount) {
            return RequestStatus.Approved;
        }

        return RequestStatus.Rejected;
    }
}