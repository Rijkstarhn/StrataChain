let Strata = artifacts.require("./strata.sol");

contract("Strata", accounts=>{
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
            await strata.requestStrataFeeChange.call(1000, {from: accounts[1]});
        } catch (error){
            err = error;
            assert(error.message.indexOf('revert')>0, "transaction should be reverted")
        }
        assert.ok(err, "should have caught error");
    });


    // call request strata fee change with accounts[0]
    it('call "requestStrataFeeChange" with accounts[0]', async ()=>{
        let strata = await Strata.deployed();
        let deadlineEpoch = (await strata.requestStrataFeeChange.call(1000, {from: accounts[0]})).toNumber();
        let deadline = new Date(deadlineEpoch);
        console.log(deadline);
    });
    // a request has been created correctly
    // an event is emitted with correct info in event data
    // deadline is returned correctly
});
