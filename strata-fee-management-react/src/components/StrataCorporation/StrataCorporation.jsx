import { useState, useContext } from "react";

import styles from "./StrataCorporation.module.css";

import { contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { TransactionInProgressContext } from "../App/App";

const StrataCorporation = ({ totalMonthlyStrataFee }) => {
	const [isRequestExpenseOpen, setRequestExpenseOpen] = useState(false);
	const [isRequestStrataFeeChangeOpen, setRequestStrataFeeChangeOpen] =
		useState(false);
	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleCollectStrataFees = async () => {
		await sendTransaction(
			contract.methods.collectStrataFeePayments(),
			setTransactionInProgress
		);
	};

	const handleExpenseRequest = () => {
		console.log("expense request sent");
	};

	const handleStrataFeeChangeRequest = () => {
		console.log("strata fee change request sent");
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
				<Button onClick={() => setRequestStrataFeeChangeOpen(true)}>
					Request Strata Fee Change
				</Button>
			</Container>

			<Dialog
				open={isRequestExpenseOpen}
				onClose={() => setRequestExpenseOpen(false)}
			>
				<DialogTitle>Expense Request Details</DialogTitle>
				<DialogContent>
					<form className={styles.form} onSubmit={handleExpenseRequest}>
						<span>Amount</span>
						<OutlinedInput
							id="expense-request-amount"
							type="number"
							onChange={(e) => {
								// setStrataFeePaymentAmount(e.target.value);
							}}
						/>
						<span>Reason</span>
						<TextField
							id="expense-request-reason"
							type="text"
							onChange={(e) => {}}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isRequestStrataFeeChangeOpen}
				onClose={() => setRequestStrataFeeChangeOpen(false)}
			>
				<DialogTitle>Strata Fee Change Request Details</DialogTitle>
				<DialogContent>
					<form className={styles.form} onSubmit={handleStrataFeeChangeRequest}>
						<span>Amount</span>
						<OutlinedInput
							id="strata-fee-change-request-amount"
							type="number"
							onChange={(e) => {
								// setStrataFeePaymentAmount(e.target.value);
							}}
						/>
						<span>Reason</span>
						<TextField
							id="strata-fee-change-request-reason"
							type="text"
							onChange={(e) => {}}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default StrataCorporation;
