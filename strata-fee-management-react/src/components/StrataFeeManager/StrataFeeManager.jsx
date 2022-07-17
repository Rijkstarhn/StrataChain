import { useState, useEffect } from "react";

import { web3, contract } from "../../web3Utils";

import styles from "./StrataFeeManager.module.css";

import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import StrataCorproation from "../StrataCorporation/StrataCorporation";
import StrataLot from "../StrataLot/StrataLot";
import RequestItem from "../RequestItem/RequestItem";

const StrataFeeManager = ({ account }) => {
	const [strataAccount, setStrataAccount] = useState(null);
	const [totalMonthlyStrataFee, setTotalMonthlyStrataFee] = useState(0);
	const [accountBalance, setAccountBalance] = useState(0);
	const [autoApproveThreshold, setAutoApproveThreshold] = useState(0);
	const [autoRejectThreshold, setAutoRejectThreshold] = useState(0);
	const [units, setUnits] = useState({});
	const [requests, setRequests] = useState({});

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
					const unitCount = await contract.methods.strataLotCount().call();

					let units = {};
					for (let i = 0; i < unitCount; ++i) {
						let strataLotId = await contract.methods.strataLotIds(i).call();
						units[strataLotId] = await contract.methods
							.units(strataLotId)
							.call();
					}

					setUnits(units);
				};

				await refreshUnits();

				const refreshRequests = async () => {
					const requestCount = await contract.methods.requestCount().call();

					let requests = {};
					for (let i = 0; i < requestCount; ++i) {
						let requestId = await contract.methods.requestIds(i).call();
						requests[requestId] = await contract.methods
							.requests(requestId)
							.call();
					}

					setRequests(requests);
				};

				await refreshRequests();

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

				contract.events.RequestModified().on("data", async (event) => {
					const { requestId } = event.returnValues;
					const updatedRequest = await contract.methods
						.requests(requestId)
						.call();
					setRequests((prevRequests) => ({
						...prevRequests,
						[requestId]: updatedRequest
					}));
				});
			} catch (err) {
				console.log(err);
			}
		})();
	}, [account]);

	const isUsingStrataAccount = account === strataAccount;

	return (
		<>
			{isUsingStrataAccount && (
				<Container disableGutters>
					<StrataCorproation totalMonthlyStrataFee={totalMonthlyStrataFee} />
				</Container>
			)}
			<Container disableGutters>
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
			<Container disableGutters>
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
			<Container disableGutters>
				<h2>Requests</h2>
				<Stack direction="row" spacing={4} className={styles.unitContainer}>
					{Object.keys(requests)
						// .filter(
						// 	(requestId) =>
						// 		requests[requestId].currentOwnership.owner.account === account
						// )
						.map((requestId) => {
							const requestItem = requests[requestId];
							return (
								<RequestItem
									key={requestId}
									requestId={requestId}
									requestType={requestItem.requestType}
									amount={requestItem.amount}
									reason={requestItem.description}
								/>
							);
						})}
				</Stack>
			</Container>
			<Container disableGutters>
				<h2>Owned Units</h2>
				<Stack direction="row" spacing={4} className={styles.unitContainer}>
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
				</Stack>
			</Container>
		</>
	);
};

export default StrataFeeManager;
