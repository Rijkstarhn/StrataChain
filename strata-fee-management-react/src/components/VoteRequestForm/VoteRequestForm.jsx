import { useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { web3, contract, sendTransaction } from "../../web3Utils";

import Select from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem';

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

export const VoteRequestForm = ({ requestId, isOpen, onClose }) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleVoteRequest = async (data) => {
        let supportsRequest = data.amount === 1? true : false
        await sendTransaction(
			contract.methods.voteOnRequest(requestId, supportsRequest),
			setTransactionInProgress
		);
	};

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title={`Vote for Request ${requestId}`}
				onSubmit={handleVoteRequest}
			>
				<span>Vote for</span>
				<Controller
					control={control}
					name="amount"
					render={({ field: { onChange } }) => (
						<Select
                            label="Option"
                            // value={option}
							onChange={(e) => onChange(e.target.value)}
						>
                            <MenuItem value={0}>No</MenuItem>
                            <MenuItem value={1}>Yes</MenuItem>
                        </Select>
					)}
					rules={{ required: true, min: 0 }}
				/>
			</DialogForm>
		</FormProvider>
	);
};

export default VoteRequestForm;
