const contractAddress = "0xB4eEfcA0CfFfd758850940A989F1e13907bb91C6";

const strata = require('../build/contracts/Strata.json');
console.log(strata.abi);
contract("testing contract", accounts=>{
    it('set last strata fee collected date', async()=>{
        let strata = new web3.eth.Contract(strata.abi, contractAddress);
        await strata.methods.setLastStrataFeeCollectedDate(5).send({from: accounts[0]});

        let lastStrataFeeCollectedDateNum = (await strata.methods.lastStrataFeeCollectedDate().call());
        console.log(`lastStrataFeeCollectedDateNum=${lastStrataFeeCollectedDateNum}`);

    })
});
