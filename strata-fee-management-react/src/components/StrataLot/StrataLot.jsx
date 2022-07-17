import { useState, useContext } from "react";

import styles from "./StrataLot.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";

import { TransactionInProgressContext } from "../App/App";
import PayStrataFeeForm from "../PayStrataFeeForm/PayStrataFeeForm";
import TransferOwnerForm from "../TransferOwnerForm/TransferOwnerForm";

const StrataLot = ({
	lotId,
	entitlement,
	strataFee,
	strataFeeBalance,
	ownership
}) => {
	const [transferOwnerAddress, setTransferOwnerAddress] = useState("");
	// const [strataFeePaymentAmount, setStrataFeePaymentAmount] = useState(0);

	const [isPayStrataFeeOpen, setPayStrataFeeOpen] = useState(false);
	const [isTransferOwnerOpen, setTransferOwnerOpen] = useState(false);

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
		<div className={styles.unitContainer}>
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
				<Button onClick={() => setPayStrataFeeOpen(true)}>
					Pay Strata Fee
				</Button>
			</div>

			<div className={styles.dataField}>
				<Button onClick={() => setTransferOwnerOpen(true)}>
					Transfer Owner
				</Button>
			</div>

			<PayStrataFeeForm
				lotId={lotId}
				isOpen={isPayStrataFeeOpen}
				onClose={() => setPayStrataFeeOpen(false)}
			/>

			<TransferOwnerForm
				lotId={lotId}
				isOpen={isTransferOwnerOpen}
				onClose={() => setTransferOwnerOpen(false)}
			/>
		</div>
	);
};

export default StrataLot;
