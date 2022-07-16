import { useState, useEffect } from "react";
import Web3 from "web3";

import styles from "./StrataFeeManager.module.css";

import { detectCurrentProvider } from "../../web3Utils";

const contractAddress = "0xf16c2a910506DeE5cc5FcD058768aB8a597AffBa";
const contractAbi = require("../../contract.json");

let web3;
let contract;

const StrataFeeManager = ({ account }) => {
	const [strataAccount, setStrataAccount] = useState(null);
	const [totalMonthlyStrataFee, setTotalMonthlyStrataFee] = useState(0);
	const [accountBalance, setAccountBalance] = useState(0);
	const [autoApproveThreshold, setAutoApproveThreshold] = useState(0);
	const [autoRejectThreshold, setAutoRejectThreshold] = useState(0);
	const [units, setUnits] = useState({});
	const [transferOwnerAddresses, setTransferOwnerAddresses] = useState({});
	const [strataFeePaymentAmount, setStrataFeePaymentAmount] = useState({});

	useEffect(() => {
		(async () => {
			try {
				const currentProvider = detectCurrentProvider();
				if (currentProvider) {
					if (currentProvider !== window.ethereum) {
						console.log(
							"Non-Ethereum browser detected. You should consider trying MetaMask!"
						);
					}
					web3 = new Web3(currentProvider);
					let ethBalance = await web3.eth.getBalance(account); // Get wallet balance
					ethBalance = web3.utils.fromWei(ethBalance, "ether"); //Convert balance to wei

					setAccountBalance(ethBalance);

					contract = new web3.eth.Contract(contractAbi, contractAddress, {
						from: account
					});

					setStrataAccount(await contract.methods.strataAccount().call());

					setTotalMonthlyStrataFee(
						web3.utils.fromWei(
							await contract.methods.totalMonthlyStrataFee().call(),
							"ether"
						)
					);

					let owner = await contract.methods.owners(account).call();
					setAutoApproveThreshold(
						web3.utils.fromWei(owner.autoApproveThreshold, "ether")
					);
					setAutoRejectThreshold(
						web3.utils.fromWei(owner.autoRejectThreshold, "ether")
					);

					const refreshUnits = async () => {
						let units = {};
						for (let i = 0; i < 3; ++i) {
							let strataLotId = await contract.methods.strataLotIds(i).call();
							units = {
								...units,
								[strataLotId]: await contract.methods.units(strataLotId).call()
							};
						}

						setUnits(units);
					};

					await refreshUnits();

					//Subscribe to events
					contract.events.StrataFeesCollected().on("data", async () => {
						await refreshUnits();
					});

					contract.events.StrataFeePaid().on("data", async (event) => {
						const { strataLotId } = event.returnValues;
						const updatedUnit = await contract.methods
							.units(strataLotId)
							.call();
						setUnits((prevUnits) => ({
							...prevUnits,
							[strataLotId]: updatedUnit
						}));
						console.log(event);
					});
				}
			} catch (err) {
				console.log(err);
			}
		})();
	}, [account]);

	const handleCollectStrataFees = async () => {
		await contract.methods.collectStrataFeePayments().send();
	};

	const handlePayStrataFee = async (strataLotId, amount) => {
		const weiToSend = web3.utils.toWei(amount, "ether");
		console.log(weiToSend);
		console.log(contract.methods);
		await contract.methods
			.payStrataFee(strataLotId)
			.send({ from: account, value: weiToSend });
	};

	const handleTransferOwner = async (strataLotId, newOwnerAccount) => {
		await contract.methods.transferOwner(strataLotId, newOwnerAccount).send();
	};

	const isUsingStrataAccount = account === strataAccount;

	return (
		<div className={styles.container}>
			<div>
				<h1>Strata Fee Manager</h1>
			</div>
			{isUsingStrataAccount && (
				<div>
					<h2>Strata Corporation Details</h2>
					This section is only visible if logged in using the strata account. We
					could use it to provide a UI for things that the strata needs to do
					<div className={styles.dataField}>
						<span className={styles.label}>Total Monthly Strata Fee: </span>
						{totalMonthlyStrataFee} ETH
					</div>
					<button onClick={() => handleCollectStrataFees()}>
						Collect Strata Fees
					</button>
				</div>
			)}
			<div>
				<h2>Wallet Information</h2>
				<div>
					<div className={styles.dataField}>
						<span className={styles.label}>Account number: </span>
						{account}
					</div>
					<div className={styles.dataField}>
						<span className={styles.label}>Balance: </span>
						{accountBalance} ETH
					</div>
				</div>
			</div>
			<div>
				<h2>Strata Account Information</h2>
				<div>
					<div className={styles.dataField}>
						<span className={styles.label}>Auto approve threshold: </span>
						{autoApproveThreshold} ETH
					</div>
					<div className={styles.dataField}>
						<span className={styles.label}>Auto reject threshold: </span>
						{autoRejectThreshold} ETH
					</div>
				</div>
			</div>
			<div>
				<h2>Owned Units</h2>
				{Object.keys(units)
					.filter(
						(strataLotId) =>
							units[strataLotId].currentOwnership.owner.account === account
					)
					.map((strataLotId) => {
						const unit = units[strataLotId];
						return (
							<div key={strataLotId} className={styles.unitContainer}>
								<div className={styles.dataField}>
									<span className={styles.label}>Lot ID: </span>
									{strataLotId}
								</div>
								<div className={styles.dataField}>
									<span className={styles.label}>Current Owner: </span>
									{unit.currentOwnership.owner.account}
								</div>
								<div className={styles.dataField}>
									<span className={styles.label}>Entitlement: </span>
									{unit.entitlement}
								</div>
								<div className={styles.dataField}>
									<span className={styles.label}>Monthly Strata Fee: </span>
									{(unit.entitlement / 600) * totalMonthlyStrataFee} ETH
								</div>
								<div className={styles.dataField}>
									<span className={styles.label}>Balance Owed: </span>
									{web3.utils.fromWei(unit.strataFeeBalance, "ether")} ETH
								</div>

								<div className={styles.dataField}>
									<button
										onClick={() =>
											handlePayStrataFee(
												strataLotId,
												strataFeePaymentAmount[strataLotId]
											)
										}
									>
										Pay Strata Fee
									</button>
									<input
										id={`pay-strata-fee-${strataLotId}`}
										type="number"
										onChange={(e) => {
											setStrataFeePaymentAmount({
												...transferOwnerAddresses,
												[strataLotId]: e.target.value
											});
										}}
									/>
								</div>

								<div className={styles.dataField}>
									<button
										onClick={() =>
											handleTransferOwner(
												strataLotId,
												transferOwnerAddresses[strataLotId]
											)
										}
									>
										Transfer Owner
									</button>
									<input
										id={`transfer-owner-${unit.strataLotId}`}
										type="text"
										onChange={(e) => {
											setTransferOwnerAddresses({
												...transferOwnerAddresses,
												[strataLotId]: e.target.value
											});
										}}
									/>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default StrataFeeManager;
