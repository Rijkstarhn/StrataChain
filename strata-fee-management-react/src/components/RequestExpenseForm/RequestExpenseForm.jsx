import { useState, useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import styles from "./RequestExpenseForm.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

export const RequestExpenseForm = ({ isOpen, onClose }) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleExpenseRequest = async (data) => {
		const weiToSend = web3.utils.toWei(data.amount, "ether");
		await sendTransaction(
			contract.methods.requestWithdrawal(weiToSend, data.reason),
			setTransactionInProgress
		);
	};

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title="Expense Request Details"
				onSubmit={handleExpenseRequest}
			>
				<span>Amount (ETH)</span>
				<Controller
					control={control}
					name="amount"
					render={({ field: { onChange } }) => (
						<OutlinedInput
							type="number"
							inputProps={{ step: "any" }}
							defaultValue={0}
							onChange={(e) => onChange(e.target.value)}
						/>
					)}
					rules={{ required: true, min: 0 }}
				/>

				<span>Reason</span>
				<Controller
					control={control}
					name="reason"
					defaultValue=""
					render={({ field: { onChange } }) => (
						<TextField type="text" onChange={(e) => onChange(e.target.value)} />
					)}
					rules={{ required: true, minLength: 1 }}
				/>
			</DialogForm>
		</FormProvider>
	);
};

export default RequestExpenseForm;
