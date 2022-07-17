import { useState, useContext } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import styles from "./DialogForm.module.css";

import { contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { TransactionInProgressContext } from "../App/App";

export const DialogForm = ({ isOpen, onClose, title, onSubmit, children }) => {
	// const methods = useForm({
	// 	mode: "onChange"
	// });
	// const { formState, handleSubmit, control } = methods;

	const { formState, handleSubmit } = useFormContext();

	const handleOnClose = (event, reason) => {
		if (reason === "backdropClick") {
			return;
		}
		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={handleOnClose} maxWidth="sm" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
					{children}

					<Button type="reset" onClick={handleOnClose}>
						Cancel
					</Button>

					<Button type="submit" disabled={!formState.isValid}>
						Submit
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default DialogForm;
