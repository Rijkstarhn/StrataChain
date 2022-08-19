let Strata = artifacts.require("./strata.sol");

contract("Strata", accounts=>{  // var accounts containing array of testing accounts
    it("strata account is accounts[0]", ()=>{
        Strata.deployed()
        .then(strata=>strata.strataAccount())
        .then(strataAcct=>{
            assert.equal(strataAcct, accounts[0], 'owner should be accounts[0]');
        })
    });

    // call request strata fee change with accounts[1]
    it('call "requestStrataFeeChange" with accounts[1]', async ()=>{
        let strata = await Strata.deployed();
        let err = null;
        try{
            await strata.requestStrataFeeChange.call(1000, "initial setup", {from: accounts[1]});    // {from: accounts[1]} means to send message as accounts[1]
        } catch (error){
            err = error;
            assert(error.message.indexOf('revert')>0, "transaction should be reverted")
        }
        assert.ok(err, "should have caught error");
    });


    // call request strata fee change with accounts[0]
    it('call "requestStrataFeeChange" with accounts[0]', async ()=>{
        let strata = await Strata.deployed();
        let deadlineEpoch = (await strata.requestStrataFeeChange.call(1000, "test", {from: accounts[0]})).toNumber() * 1000;    // value returned from contracts are in seconds
        let diffInDays = Math.round((new Date(deadlineEpoch) - Date.now()) / 86400000); // 1 day = 1000  x 60  x 60 x 24 = 86,400,000 ms 

        // deadline is returned correctly
        assert.equal(diffInDays, 7, 'should return 7 days from now');
        let result = await strata.requestStrataFeeChange(1000, "initial setup");
        assert.ok(result.logs.length > 0, 'there should be some logs');
        // an event is emitted with correct info in event data
        assert.equal(result.logs[0].event, 'RequestModified', 'Event should be "RequestModified"');
        assert.equal(result.logs[0].args.requestId, 0, "request id should be zero");

        let requestItem = await strata.requests(0);
        assert.equal(requestItem.amount, 1000, "amount should be 1000");
        
        // request 2 more time to see whether the request id increases correctly
        result = await strata.requestStrataFeeChange(1111, "inflation");
        result = await strata.requestStrataFeeChange(2222, "further inflation");
        assert.ok(result.logs.length > 0, 'there should be some logs');
        assert.equal(result.logs[0].args.requestId, 2, "request 3rd time should return 2");

        requestItem = await strata.requests(2);
        // a request has been created correctly
        assert.equal(requestItem.amount, 2222, "amount should be 2222");
        assert.equal(requestItem.description, "further inflation", "should be further inflation");
    });

    it('strata fee change - pending before 2 approval votes, approved after more than half lot owners approved', async ()=>{
        let proposedFee = 5* (10**9);
        let strata = await Strata.deployed();

        // request strata fee change
        let result = (await strata.requestStrataFeeChange(proposedFee , "initial setup"));    // value returned from contracts are in seconds
        let requestId = result.logs[0].args.requestId;
        let request = await strata.requests(requestId);
        assert.equal(request.amount.toNumber(), proposedFee, "request amount should be 10**9");

        // transfer ownerships to 3 different accounts
        await strata.transferOwner(1, accounts[1]);
        await strata.transferOwner(2, accounts[2]);
        await strata.transferOwner(3, accounts[3]);
        let unit1 = await strata.units(1);
        assert.equal(unit1.entitlement, 119, "incorrect entitlement for lot 1");
        assert.equal(unit1.currentOwnership.ownerAccount , accounts[1], 'unit 1 should be transferred to account 1');

        let status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 2, "status should be zero - Pending");

        // vote for lot 1
        await strata.voteOnRequest(requestId, true, 1, {from: accounts[1]});
        status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 2, "status should be zero - Pending");


        // vote for lot 3        
        await strata.voteOnRequest(requestId, true, 3, {from: accounts[3]});
        request = await strata.requests(requestId);
        assert.equal(request.approvalVoteCount, 2, "there should be 2 approval vote");

        //strata lot count
        let strataLotCount = (await strata.strataLotCount()).toNumber();
        assert.equal(strataLotCount, 3, "there should be 3 strata lots");

        // > 1/2 approve change
        status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 0, "status should be zero - Approved");

        // actual transaction
        await strata.confirmStrataFeeChange(requestId);
        let newFee = (await strata.totalMonthlyStrataFee()).toNumber();
        assert.equal(newFee, proposedFee, "strata fee should be changed");

    });
});


contract("Strata 2", accounts =>{
    it('strata fee change - vote is over, approval votes > rejection votes', async ()=>{
        let proposedFee = 6* (10**9);
        let strata = await Strata.deployed();

        // request strata fee change
        let result = (await strata.requestStrataFeeChange(proposedFee , "initial setup", 1));    
        let requestId = result.logs[0].args.requestId;
        let request = await strata.requests(requestId);
        assert.equal(request.amount.toNumber(), proposedFee, "request amount should be 10**9");

        // transfer ownerships to 3 different accounts
        await strata.transferOwner(1, accounts[1]);
        await strata.transferOwner(2, accounts[2]);
        await strata.transferOwner(3, accounts[3]);
        let unit1 = await strata.units(1);
        assert.equal(unit1.entitlement, 119, "incorrect entitlement for lot 1");
        assert.equal(unit1.currentOwnership.ownerAccount , accounts[1], 'unit 1 should be transferred to account 1');

        // vote
        await strata.voteOnRequest(requestId, true, [1], {from: accounts[1]});

        await new Promise((r, v)=>{
            setTimeout(()=>{
                r(true);
            }, 3000);
        });
        // deadline has passed
        let status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 0, "status should be zero - Approved");

        // actual transaction
        await strata.confirmStrataFeeChange(requestId);
        let newFee = (await strata.totalMonthlyStrataFee()).toNumber();
        assert.equal(newFee, proposedFee, "strata fee should be changed");

        request = await strata.requests(requestId);
        assert.equal(request.status, 0, "status should be zero - Approved");
    });
});
contract("Strata 3", accounts =>{
    
    it('strata fee change - more than half rejected', async ()=>{
        let proposedFee = 6* (10**9);
        let strata = await Strata.deployed();

        // request strata fee change
        let result = (await strata.requestStrataFeeChange(proposedFee , "initial setup"));    
        let requestId = result.logs[0].args.requestId;
        let request = await strata.requests(requestId);
        assert.equal(request.amount.toNumber(), proposedFee, "request amount should be 10**9");

        // transfer ownerships to 3 different accounts
        await strata.transferOwner(1, accounts[1]);
        await strata.transferOwner(2, accounts[2]);
        await strata.transferOwner(3, accounts[3]);
        let unit1 = await strata.units(1);
        assert.equal(unit1.entitlement, 119, "incorrect entitlement for lot 1");
        assert.equal(unit1.currentOwnership.ownerAccount , accounts[1], 'unit 1 should be transferred to account 1');

        // vote
        await strata.voteOnRequest(requestId, false, [1], {from: accounts[1]});
        await strata.voteOnRequest(requestId, false, [2], {from: accounts[2]});

        let status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 1, "status should be one [Rejected]");

        // actual transaction
        await strata.confirmStrataFeeChange(requestId);
        let newFee = (await strata.totalMonthlyStrataFee()).toNumber();
        assert.equal(newFee, 1000, "strata fee should NOT be changed");

        request = await strata.requests(requestId);
        assert.equal(request.status, 1, "status should be one [Rejected] ");
        

    });
});
contract("Strata 4", accounts =>{
    
    it('strata fee change - vote is over, approve votes <= reject votes', async ()=>{
        let proposedFee = 6* (10**9);
        let strata = await Strata.deployed();

        console.log(new Date());
        let deadlineEpoch = (await strata.requestStrataFeeChange.call(1000, "test", 1, {from: accounts[0]})).toNumber() * 1000;    // value returned from contracts are in seconds
        console.log(new Date(deadlineEpoch));
        // request strata fee change
        let result = (await strata.requestStrataFeeChange(proposedFee , "initial setup", 1));    
        let requestId = result.logs[0].args.requestId;
        let request = await strata.requests(requestId);
        assert.equal(request.amount.toNumber(), proposedFee, "request amount should be 10**9");

        // transfer ownerships to 3 different accounts
        await strata.transferOwner(1, accounts[1]);
        await strata.transferOwner(2, accounts[2]);
        await strata.transferOwner(3, accounts[3]);
        let unit1 = await strata.units(1);
        assert.equal(unit1.entitlement, 119, "incorrect entitlement for lot 1");
        assert.equal(unit1.currentOwnership.ownerAccount , accounts[1], 'unit 1 should be transferred to account 1');

        // vote
        await strata.voteOnRequest(requestId, false, [1], {from: accounts[1]});

        await new Promise((r, v)=>{
            setTimeout(()=>{
                r(true);
            }, 3000);
        });
        // deadline has passed
        let status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        assert.equal(status, 1, "status should be one [Rejected]");

        // actual transaction
        await strata.confirmStrataFeeChange(requestId);
        let newFee = (await strata.totalMonthlyStrataFee()).toNumber();
        assert.equal(newFee, 1000, "strata fee should NOT be changed");

        request = await strata.requests(requestId);
        assert.equal(request.status, 1, "status should be one [Rejected] ");
    });
    
});
