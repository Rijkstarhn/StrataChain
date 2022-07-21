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
        let deadlineEpoch = (await strata.requestStrataFeeChange.call(1000, {from: accounts[0]})).toNumber() * 1000;    // value returned from contracts are in seconds
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
});
