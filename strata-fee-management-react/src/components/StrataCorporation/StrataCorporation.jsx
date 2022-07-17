import { useState, useContext } from "react";

import styles from "./StrataCorporation.module.css";

import { contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";

import { TransactionInProgressContext } from "../App/App";

const StrataCorporation = ({ totalMonthlyStrataFee }) => {
	const [isRequestExpenseOpen, setRequestExpenseOpen] = useState(false);
	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleCollectStrataFees = async () => {
		await sendTransaction(
			contract.methods.collectStrataFeePayments(),
			setTransactionInProgress
		);
	};

	return (
		<>
			<Container>
				<h2>Strata Corporation Details</h2>
				This section is only visible if logged in using the strata account. We
				could use it to provide a UI for things that the strata needs to do
				<div className={styles.dataField}>
					<span className={styles.label}>Total Monthly Strata Fee: </span>
					{totalMonthlyStrataFee} ETH
				</div>
				<Button onClick={() => handleCollectStrataFees()}>
					Collect Strata Fees
				</Button>
				<Button onClick={() => setRequestExpenseOpen(true)}>
					Request Expense
				</Button>
			</Container>
			<Dialog
				open={isRequestExpenseOpen}
				onClose={() => setRequestExpenseOpen(false)}
			>
				<Container>
					<span>Amount</span>
					<TextField
						id="expense-request-amount"
						type="number"
						onChange={(e) => {
							// setStrataFeePaymentAmount(e.target.value);
						}}
					/>
					ETH
				</Container>
			</Dialog>
		</>
	);
};

export default StrataCorporation;
