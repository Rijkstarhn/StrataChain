let Strata = artifacts.require("./strata.sol");

contract('contract strata fee collection', accounts => {
    let strata;
    let toBN = web3.utils.toBN;
    it('collect fee for 23 day', async () => {
        strata = await Strata.deployed();

        let d = 23;
        await strata.setLastStrataFeeCollectedDate(d);
        // let lastStrataFeeCollectedDateNum = (await strata.lastStrataFeeCollectedDate()).toNumber();
        // console.log(`lastStrataFeeCollectedDateNum=${lastStrataFeeCollectedDateNum}`);

        await strata.collectStrataFeePayments();
        // console.log(result.logs[0].args);


        let expectedFeePerEntitlement = toBN(79039000000000);
        let unit1 = await strata.units(1);
        let expectedUnit1Balance = expectedFeePerEntitlement.muln(119).muln(d);
        assert.isTrue(unit1.strataFeeBalance.eq(expectedUnit1Balance), "incorrect unit 1 balance");

        assert.isTrue((await strata.units(2)).strataFeeBalance.eq(expectedFeePerEntitlement.muln(115).muln(d)), "incorrect unit 2 balance");
        assert.isTrue((await strata.units(3)).strataFeeBalance.eq(expectedFeePerEntitlement.muln(108).muln(d)), "incorrect unit 2 balance");
        
        // unit 0 was owned by current owner since yesterday
        let unit0 = await strata.units(0);
        // console.log(unit0.strataFeeBalance.toString());
        // console.log(expectedFeePerEntitlement.muln(93).toString());
        assert.isTrue((await strata.units(0)).strataFeeBalance.eq(expectedFeePerEntitlement.muln(93)), "incorrect unit 0 balance");

        let updatedStrataFeeCollectedDate = await strata.lastStrataFeeCollectedDate();
        // console.log(updatedStrataFeeCollectedDate);
        // console.log(new Date(updatedStrataFeeCollectedDate * 86400000).toISOString());
    });

    it('transfer ownership with refund', async()=>{
        // let d = 23;
        // await strata.setLastStrataFeeCollectedDate(d);

        let balance = (await strata.units(1)).strataFeeBalance;
        console.log(` balance before paying 2 eth = ${balance.toString()}`);
        // console.lot(`${web3.utils.toWei(2, 'ether')}`);
        await strata.payStrataFee(1, {value: web3.utils.toWei('2', "ether")});
        balance = (await strata.units(1)).strataFeeBalance;
        console.log(` balance after paying 2 eth = ${balance.toString()}`);
        let result = await strata.transferOwner(1, accounts[2]);
        let refundAmount = result.logs[0].args.amount;
        console.log(result.logs[0].args.amount.toString());
        assert.equal(refundAmount.add(balance).toString(), "0", "Refund should be the -ve of remaining balance");
        console.log(result.logs[1].args);
    });

    it('transfer ownership with unsettledAmount', async()=>{

        let balance =(await strata.units(2)).strataFeeBalance; 

        let result = await strata.transferOwner(2, accounts[2]);
        let unsettledFee = result.logs[0].args.amount;

        
        console.log(result.logs[0].args);

        console.log(`Unsettled Fee = ${unsettledFee.toString()}`);

        assert.equal(unsettledFee.sub(balance).toString(), "0" , "Unsettled Fee should be the remaining balance");
    });

    it('transfer ownership without unsettlement nor refund', async()=>{

        let balance =(await strata.units(3)).strataFeeBalance; 
        await strata.payStrataFee(3, {value: balance});

        let result = await strata.transferOwner(3, accounts[2]);
        

        
        console.log(result.logs);
        assert.equal(result.logs.length, 1, "only 1 event should be emitted");

    });
})
