import { useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import styles from "./PayStrataFeeForm.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import OutlinedInput from "@mui/material/OutlinedInput";

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

export const PayStrataFeeForm = ({ lotId, isOpen, onClose }) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handlePayStrataFee = async (data) => {
		const weiToSend = web3.utils.toWei(data.amount, "ether");
		await sendTransaction(
			contract.methods.payStrataFee(lotId),
			setTransactionInProgress,
			{ value: weiToSend }
		);
	};

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title={`Payment Information for Lot ID ${lotId}`}
				onSubmit={handlePayStrataFee}
			>
				<span>Amount</span>
				<Controller
					control={control}
					name="amount"
					render={({ field: { onChange } }) => (
						<OutlinedInput
							type="number"
							defaultValue={0}
							onChange={(e) => onChange(e.target.value)}
						/>
					)}
					rules={{ required: true, min: 0 }}
				/>
			</DialogForm>
		</FormProvider>
	);
};

export default PayStrataFeeForm;
