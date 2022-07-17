import { useState, useContext } from "react";

import styles from "./StrataLot.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { TransactionInProgressContext } from "../App/App";

const StrataLot = ({
	lotId,
	entitlement,
	strataFee,
	strataFeeBalance,
	ownership
}) => {
	const [transferOwnerAddress, setTransferOwnerAddress] = useState("");
	const [strataFeePaymentAmount, setStrataFeePaymentAmount] = useState(0);
	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handlePayStrataFee = async (amount) => {
		const weiToSend = web3.utils.toWei(amount, "ether");
		await sendTransaction(
			contract.methods.payStrataFee(lotId),
			setTransactionInProgress,
			{ value: weiToSend }
		);
	};

	const handleTransferOwner = async (newOwnerAccount) => {
		await sendTransaction(
			contract.methods.transferOwner(lotId, newOwnerAccount),
			setTransactionInProgress
		);
	};

	return (
		<Container>
			<div className={styles.dataField}>
				<span className={styles.label}>Lot ID: </span>
				{lotId}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Current Owner: </span>
				{ownership.owner.account}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Entitlement: </span>
				{entitlement}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Monthly Strata Fee: </span>
				{strataFee} ETH
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Balance Owed: </span>
				{web3.utils.fromWei(strataFeeBalance, "ether")} ETH
			</div>

			<div className={styles.dataField}>
				<Button onClick={() => handlePayStrataFee(strataFeePaymentAmount)}>
					Pay Strata Fee
				</Button>
				<TextField
					id={`pay-strata-fee-${lotId}`}
					type="number"
					onChange={(e) => {
						setStrataFeePaymentAmount(e.target.value);
					}}
				/>
			</div>

			<div className={styles.dataField}>
				<Button onClick={() => handleTransferOwner(transferOwnerAddress)}>
					Transfer Owner
				</Button>
				<TextField
					id={`transfer-owner-${lotId}`}
					type="text"
					onChange={(e) => {
						setTransferOwnerAddress(e.target.value);
					}}
				/>
			</div>
		</Container>
	);
};

export default StrataLot;
