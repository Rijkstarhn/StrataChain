import { useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import styles from "./TransferOwnerForm.module.css";

import { contract, sendTransaction } from "../../web3Utils";

import OutlinedInput from "@mui/material/OutlinedInput";

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

const placeholderAddress = "0xaaaaaaabbbbbbbcccccccdddddddeeeeeeefffffff";

export const TransferOwnerForm = ({ lotId, isOpen, onClose }) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleTransferOwner = async (data) => {
		await sendTransaction(
			contract.methods.transferOwner(lotId, data.newOwnerAccount),
			setTransactionInProgress
		);
	};

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title={`Ownership Transfer for Lot ID ${lotId}`}
				onSubmit={handleTransferOwner}
			>
				<span>Transfer to</span>
				<Controller
					control={control}
					name="newOwnerAccount"
					render={({ field: { onChange } }) => (
						<OutlinedInput
							type="text"
							placeholder={placeholderAddress}
							onChange={(e) => onChange(e.target.value)}
						/>
					)}
					rules={{ required: true, pattern: /^(0[xX])?[A-Fa-f0-9]{42}$/ }}
				/>
			</DialogForm>
		</FormProvider>
	);
};

export default TransferOwnerForm;
