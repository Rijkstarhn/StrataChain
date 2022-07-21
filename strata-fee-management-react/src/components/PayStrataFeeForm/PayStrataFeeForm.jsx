import { useContext } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import styles from "./PayStrataFeeForm.module.css";

import { web3, contract, voteOnRequest } from "../../web3Utils";

import Select from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem';

import { TransactionInProgressContext } from "../App/App";
import DialogForm from "../DialogForm/DialogForm";

export const PayStrataFeeForm = ({ requestId, isOpen, onClose }) => {
	const methods = useForm({
		mode: "onChange"
	});
	const { control } = methods;

	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handlePayStrataFee = async (data) => {
        // console.log("option", data.amount)
        let option = data.amount === 1? true : false
        console.log("option", option)
		// const weiToSend = web3.utils.toWei(data.amount, "ether");
		// await voteOnRequest(
		// 	,
		// 	option,
		// 	lotId
		// );
	};

    // const [option, setOption] = React.useState(0);
    // const handleChange = event => {
    //     setOption(event.target.value);
    // };

	return (
		<FormProvider {...methods}>
			<DialogForm
				isOpen={isOpen}
				onClose={onClose}
				title={`Vote for Request ${requestId}`}
				onSubmit={handlePayStrataFee}
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

export default PayStrataFeeForm;
