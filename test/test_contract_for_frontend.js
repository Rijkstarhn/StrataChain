let Strata = artifacts.require("./strata.sol");

contract("Strata 2", accounts =>{
    it('strata fee change  ', async ()=>{
        let proposedFee = web3.utils.toWei('50', 'ether');
        let strata = await Strata.deployed();

        // request strata fee change
        let result = (await strata.requestStrataFeeChange(proposedFee , "initial setup" ));    
        let requestId = result.logs[0].args.requestId;
        let request = await strata.requests(requestId);
        assert.equal(request.amount.toString(), proposedFee, "request amount incorrect!");

        // transfer ownerships to 3 different accounts
        await strata.transferOwner(1, accounts[1]);
        await strata.transferOwner(2, accounts[2]);
        await strata.transferOwner(3, accounts[3]);
        let unit1 = await strata.units(1);
        assert.equal(unit1.entitlement, 100, "incorrect entitlement for lot 1");
        assert.equal(unit1.currentOwnership.owner.account , accounts[1], 'unit 1 should be transferred to account 1');

        // vote
        await strata.voteOnRequest(requestId, true, 1, {from: accounts[1]});
        // await strata.voteOnRequest(requestId, true, 2, {from: accounts[2]});

        // await new Promise((r, v)=>{
        //     setTimeout(()=>{
        //         r(true);
        //     }, 3000);
        // });
        // // deadline has passed
        // let status = (await strata.confirmStrataFeeChange.call(requestId)).toNumber();
        // assert.equal(status, 0, "status should be zero - Approved");

        // // actual transaction
        // await strata.confirmStrataFeeChange(requestId);
        // let newFee = (await strata.totalMonthlyStrataFee()).toNumber();
        // assert.equal(newFee, proposedFee, "strata fee should be changed");

        // request = await strata.requests(requestId);
        // assert.equal(request.status, 0, "status should be zero - Approved");
        console.log(`contract address: ${strata.address}`);
    });
});