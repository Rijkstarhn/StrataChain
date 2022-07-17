import { useState, useContext } from "react";

import styles from "./RequestItem.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";

import { TransactionInProgressContext } from "../App/App";
import PayStrataFeeForm from "../PayStrataFeeForm/PayStrataFeeForm";
import TransferOwnerForm from "../TransferOwnerForm/TransferOwnerForm";

const RequestItem = ({ requestId, requestType, amount, reason }) => {
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

	return (
		<div className={styles.unitContainer}>
			<div className={styles.dataField}>
				<span className={styles.label}>Request ID: </span>
				{requestId}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Request Type: </span>
				{requestType}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Amount: </span>
				{amount}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Reason: </span>
				{reason}
			</div>

			<div className={styles.dataField}>
				<Button onClick={() => setVoteOnRequestOpen(true)}>
					Vote on Request
				</Button>
			</div>

			<PayStrataFeeForm
				lotId={requestId}
				isOpen={isVoteOnRequestOpen}
				onClose={() => setVoteOnRequestOpen(false)}
			/>
		</div>
	);
};

export default RequestItem;
