import { useState, useContext } from "react";

import styles from "./RequestItem.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { TransactionInProgressContext } from "../App/App";
import PayStrataFeeForm from "../PayStrataFeeForm/PayStrataFeeForm";
import TransferOwnerForm from "../TransferOwnerForm/TransferOwnerForm";

const RequestItem = ({
	requestId,
	requestType,
	requestStatus,
	amount,
	reason,
	isStrataCorporation,
	voteDeadline
}) => {
	const [isVoteOnRequestOpen, setVoteOnRequestOpen] = useState(false);

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	// const handlePayStrataFee = async (amount) => {
	// 	const weiToSend = web3.utils.toWei(amount, "ether");
	// 	await sendTransaction(
	// 		contract.methods.payStrataFee(lotId),
	// 		setTransactionInProgress,
	// 		{ value: weiToSend }
	// 	);
	// };

	// const handleTransferOwner = async (newOwnerAccount) => {
	// 	await sendTransaction(
	// 		contract.methods.transferOwner(lotId, newOwnerAccount),
	// 		setTransactionInProgress
	// 	);
	// };

	let withdrawFundsButton = null;
	let updateStrataFeeButton = null;
	let voteByDate = new Date(parseInt(voteDeadline) * 1000).toDateString();

	if (isStrataCorporation) {
		if (requestStatus === "Approved") {
			if (requestType === "Expense") {
				withdrawFundsButton = (
					<div className={styles.dataField}>
						<Button onClick={() => {}}>Withdraw Funds</Button>
					</div>
				);
			} else if (requestType === "Strata Fee Change") {
				updateStrataFeeButton = (
					<div className={styles.dataField}>
						<Button onClick={() => {}}>Update Strata Fee</Button>
					</div>
				);
			}
		} else if (requestStatus === "Pending") {
			//TODO: We could potentially support having the strata decline a request
			//if they no longer need it
		}
	}

	return (
		<Card variant="outlined">
			<CardHeader
				title={`Request ${requestId}`}
				titleTypographyProps={{ className: styles.cardHeaderTitle }}
				className={styles.cardHeader}
			/>
			<CardContent>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Type:</Typography>
					<Typography className={styles.value}>{requestType}</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Status:</Typography>
					<Typography className={styles.value}>{requestStatus}</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Amount:</Typography>
					<Typography className={styles.value}>{amount}</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Reason:</Typography>
					<Typography className={styles.value}>{reason}</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Vote by:</Typography>
					<Typography className={styles.value}>{voteByDate}</Typography>
				</div>
			</CardContent>

			<CardActions disableSpacing className={styles.actions}>
				<div className={styles.dataField}>
					<Button onClick={() => setVoteOnRequestOpen(true)}>
						Vote on Request
					</Button>
				</div>

				{withdrawFundsButton}

				{updateStrataFeeButton}
			</CardActions>

			<PayStrataFeeForm
				lotId={requestId}
				isOpen={isVoteOnRequestOpen}
				onClose={() => setVoteOnRequestOpen(false)}
			/>
		</Card>
	);
};

export default RequestItem;
