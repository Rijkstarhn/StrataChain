import { useState, useEffect, createContext } from "react";

import { web3, contract } from "../../web3Utils";

import styles from "./StrataFeeManager.module.css";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import StrataCorporation from "../StrataCorporation/StrataCorporation";
import StrataLot from "../StrataLot/StrataLot";
import RequestItem from "../RequestItem/RequestItem";

export const TriggerRefreshContext = createContext();

const mapRequestType = (requestTypeEnum) => {
	switch (requestTypeEnum) {
		case "0":
			return "Expense";
		case "1":
			return "Strata Fee Change";
		default:
			return "Unknown";
	}
};

const mapRequestStatus = (requestStatusEnum) => {
	switch (requestStatusEnum) {
		case "0":
			return "Approved";
		case "1":
			return "Rejected";
		case "2":
			return "Pending";
	}
};
const StrataFeeManager = ({ account }) => {
	const [strataAccount, setStrataAccount] = useState(null);
	const [totalMonthlyStrataFee, setTotalMonthlyStrataFee] = useState(0);
	const [accountBalance, setAccountBalance] = useState(0);
	const [autoApproveThreshold, setAutoApproveThreshold] = useState(0);
	const [autoRejectThreshold, setAutoRejectThreshold] = useState(0);
	const [units, setUnits] = useState({});
	const [requests, setRequests] = useState({});
	const [trigger, setTrigger] = useState(false);

	const triggerRefresh = ()=>{
		setTrigger(!trigger);
	}

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
                    console.log("units", units);

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

				contract.events.StrataFeePaid(
					{ fromBlock: "latest" },
					async (error, event) => {
						const { strataLotId } = event.returnValues;
						const updatedUnit = await contract.methods
							.units(strataLotId)
							.call();
						setUnits((prevUnits) => ({
							...prevUnits,
							[strataLotId]: updatedUnit
						}));
						console.log(event);
					}
				);

				contract.events.RequestModified(
					{ fromBlock: "latest" },
					async (error, event) => {
						console.log(event);
						const { requestId } = event.returnValues;
						const updatedRequest = await contract.methods
							.requests(requestId)
							.call();
						setRequests((prevRequests) => ({
							...prevRequests,
							[requestId]: updatedRequest
						}));
					}
				);

				contract.events.OwnershipTransferred(
					{ fromBlock: "latest" },
					async (error, event) => {
						const { strataLotId } = event.returnValues;
						const updatedUnit = await contract.methods
							.units(strataLotId)
							.call();
						setUnits((prevUnits) => ({
							...prevUnits,
							[strataLotId]: updatedUnit
						}));
						console.log(event);
					}
				);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [account, trigger]);

	const isUsingStrataAccount = account === strataAccount;

	const ownedUnits = Object.keys(units)
	.filter(
		(strataLotId) =>
			units[strataLotId].currentOwnership.owner.account === account
	);
	return (
		<TriggerRefreshContext.Provider value={triggerRefresh}>
			{isUsingStrataAccount && (
				<Container disableGutters>
					<StrataCorporation
						totalMonthlyStrataFee={totalMonthlyStrataFee}
						units={units}
					/>
				</Container>
			)}
			<Container disableGutters>
				<Typography className={styles.header}>Owner Information</Typography>
				<Typography className={styles.subHeader}>Wallet</Typography>
				<div>
					<div className={styles.dataField}>
						<Typography className={styles.label}>Account number:</Typography>
						<Typography className={styles.value}>{account}</Typography>
					</div>
					<div className={styles.dataField}>
						<Typography className={styles.label}>Balance:</Typography>
						<Typography className={styles.value}>
							{accountBalance} ETH
						</Typography>
					</div>
				</div>
			</Container>
			<Container disableGutters>
				<Typography className={styles.subHeader}>Strata Account</Typography>
				<div>
					<div className={styles.dataField}>
						<Typography className={styles.label}>
							Expense Auto Approval Threshold:
						</Typography>
						<Typography className={styles.value}>
							{autoApproveThreshold} ETH
						</Typography>
					</div>
					<div className={styles.dataField}>
						<Typography className={styles.label}>
							Expense Auto Rejection Threshold:
						</Typography>
						<Typography className={styles.value}>
							{autoRejectThreshold} ETH
						</Typography>
					</div>
				</div>
			</Container>
			<Container disableGutters>
				<Typography className={styles.subHeader}>Requests</Typography>
				<Stack direction="row" spacing={4} className={styles.unitContainer}>
					{Object.keys(requests).map((requestId) => {
						const requestItem = requests[requestId];
						return (
							<RequestItem
								key={requestId}
								requestId={requestId}
								requestType={mapRequestType(requestItem.requestType)}
								requestStatus={mapRequestStatus(requestItem.status)}
								amount={requestItem.amount}
								reason={requestItem.description}
								voteDeadline={requestItem.voteDeadline}
								isStrataCorporation={isUsingStrataAccount}
                                yesCounts = {requestItem.approvalVoteCount}
                                noCounts = {requestItem.rejectionVoteCount}
								isOwner={ownedUnits.length>0}
                                ownedUnits={ownedUnits}
							/>
						);
					})}
				</Stack>
			</Container>
			<Container disableGutters>
				<Typography className={styles.subHeader}>Owned Units</Typography>
				<Stack direction="row" spacing={4} className={styles.unitContainer}>
					{ownedUnits
						.map((strataLotId) => {
							const unit = units[strataLotId];
							return (
								<StrataLot
									key={strataLotId}
									lotId={strataLotId}
									entitlement={unit.entitlement}
									strataFee={(unit.entitlement / 600) * totalMonthlyStrataFee}
									strataFeeBalance={unit.strataFeeBalance}
									isOwner
								/>
							);
						})}
				</Stack>
			</Container>
		</TriggerRefreshContext.Provider>
	);
};

export default StrataFeeManager;