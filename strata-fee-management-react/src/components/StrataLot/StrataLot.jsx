import { useState, useContext } from "react";

import styles from "./StrataLot.module.css";

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

const StrataLot = ({
	lotId,
	entitlement,
	strataFee,
	strataFeeBalance,
	isOwner
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
		<Card variant="outlined">
			<CardHeader
				title={`Unit ${lotId}`}
				titleTypographyProps={{ className: styles.cardHeaderTitle }}
				className={styles.cardHeader}
			/>
			<CardContent>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Entitlement:</Typography>
					<Typography className={styles.value}>{entitlement}</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Monthly Strata Fee:</Typography>
					<Typography className={styles.value}>{strataFee} ETH</Typography>
				</div>
				<div className={styles.dataField}>
					<Typography className={styles.label}>Balance Owed:</Typography>
					<Typography className={styles.value}>
						{web3.utils.fromWei(strataFeeBalance, "ether")} ETH
					</Typography>
				</div>
			</CardContent>

			{isOwner && (
				<CardActions disableSpacing className={styles.actions}>
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
				</CardActions>
			)}
		</Card>
	);
};

export default StrataLot;
