import { useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import styles from "./ChangeThresholdForm.module.css";

import { web3, contract, sendTransaction } from "../../web3Utils";

import OutlinedInput from "@mui/material/OutlinedInput";

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

export const ChangeThresholdForm = ({isApproval, isOpen, onClose}) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

    const thresholdOption = isApproval? "Approval" : "Rejection";

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleThresholdChange = async (data) => {
        const weiToSend = web3.utils.toWei(data.amount, "ether");
        if (isApproval) {
            console.log("change approval threshold");
            await sendTransaction(
                contract.methods.setAutoApproveThreshold(weiToSend),
                setTransactionInProgress
            );
        } else {
            console.log("change reject threshold");
            await sendTransaction(
                contract.methods.setAutoRejectThreshold(weiToSend),
                setTransactionInProgress
            );
        }
	};

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title={`Change ${thresholdOption} Threshold to:`}
				onSubmit={handleThresholdChange}
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
			</DialogForm>
		</FormProvider>
	);
};

export default ChangeThresholdForm;