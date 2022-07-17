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
import RequestExpenseForm from "../RequestExpenseForm/RequestExpenseForm";
import RequestStrataFeeChangeForm from "../RequestStrataFeeChangeForm/RequestStrataFeeChangeForm";

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

	// const handleExpenseRequest = () => {
	// 	console.log("expense request sent");
	// };

	const handleStrataFeeChangeRequest = () => {
		console.log("strata fee change request sent");
	};

	return (
		<>
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
			<RequestExpenseForm
				isOpen={isRequestExpenseOpen}
				onClose={() => setRequestExpenseOpen(false)}
			/>
			<RequestStrataFeeChangeForm
				isOpen={isRequestStrataFeeChangeOpen}
				onClose={() => setRequestStrataFeeChangeOpen(false)}
			/>
		</>
	);
};

export default StrataCorporation;
