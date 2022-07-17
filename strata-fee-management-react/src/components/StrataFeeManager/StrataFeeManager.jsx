import { useState, useEffect } from "react";

import { web3, contract } from "../../web3Utils";

import styles from "./StrataFeeManager.module.css";

import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

import StrataCorproation from "../StrataCorporation/StrataCorporation";
import StrataLot from "../StrataLot/StrataLot";

const StrataFeeManager = ({ account }) => {
	const [strataAccount, setStrataAccount] = useState(null);
	const [totalMonthlyStrataFee, setTotalMonthlyStrataFee] = useState(0);
	const [accountBalance, setAccountBalance] = useState(0);
	const [autoApproveThreshold, setAutoApproveThreshold] = useState(0);
	const [autoRejectThreshold, setAutoRejectThreshold] = useState(0);
	const [units, setUnits] = useState({});

	useEffect(() => {
		(async () => {
			try {
				let ethBalance = await web3.eth.getBalance(account); // Get wallet balance
				ethBalance = web3.utils.fromWei(ethBalance, "ether"); //Convert balance to wei

				setAccountBalance(ethBalance);

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
					const updatedUnit = await contract.methods.units(strataLotId).call();
					setUnits((prevUnits) => ({
						...prevUnits,
						[strataLotId]: updatedUnit
					}));
					console.log(event);
				});
			} catch (err) {
				console.log(err);
			}
		})();
	}, [account]);

	const isUsingStrataAccount = account === strataAccount;

	return (
		<Container>
			<div>
				<h1>Strata Fee Manager</h1>
			</div>
			{isUsingStrataAccount && (
				<>
					<StrataCorproation totalMonthlyStrataFee={totalMonthlyStrataFee} />
				</>
			)}
			<Container>
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
			</Container>
			<Container>
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
			</Container>
			<Container>
				<h2>Owned Units</h2>
				{Object.keys(units)
					.filter(
						(strataLotId) =>
							units[strataLotId].currentOwnership.owner.account === account
					)
					.map((strataLotId) => {
						const unit = units[strataLotId];
						return (
							<StrataLot
								key={strataLotId}
								lotId={strataLotId}
								entitlement={unit.entitlement}
								strataFee={(unit.entitlement / 600) * totalMonthlyStrataFee}
								strataFeeBalance={unit.strataFeeBalance}
								ownership={unit.currentOwnership}
							/>
						);
					})}
			</Container>
		</Container>
	);
};

export default StrataFeeManager;
