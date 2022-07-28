let Strata = artifacts.require("./strata.sol");

contract('contract strata fee collection', accounts => {
    let strata;
    let toBN = web3.utils.toBN;
    it('collect fee for 1 day', async () => {
        strata = await Strata.deployed();

        let d = 23;
        await strata.testSetLastStrataFeeCollectedDate(d);
        let lastStrataFeeCollectedDateNum = (await strata.lastStrataFeeCollectedDate()).toNumber();
        // console.log(`lastStrataFeeCollectedDateNum=${lastStrataFeeCollectedDateNum}`);

        let result = await strata.collectStrataFeePayments();
        // console.log(result.logs[0].args);


        let expectedFeePerEntitlement = toBN(10000000000000).muln(d);
        let unit1 = await strata.units(1);
        let expectedUnit1Balance = expectedFeePerEntitlement.muln(100);
        // console.log(expectedUnit1Balance);
        assert.isTrue(unit1.strataFeeBalance.eq(expectedUnit1Balance), "incorrect unit 1 balance");

        assert.isTrue((await strata.units(2)).strataFeeBalance.eq(expectedFeePerEntitlement.muln(200)), "incorrect unit 2 balance");
        assert.isTrue((await strata.units(3)).strataFeeBalance.eq(expectedFeePerEntitlement.muln(300)), "incorrect unit 2 balance");

    });
})
