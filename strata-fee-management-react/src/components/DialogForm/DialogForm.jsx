import { useFormContext } from "react-hook-form";

import styles from "./DialogForm.module.css";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export const DialogForm = ({ isOpen, onClose, title, onSubmit, children }) => {
	const { formState, handleSubmit, reset } = useFormContext();

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

					<IconButton className={styles.closeButton} onClick={handleOnClose}>
						<CloseIcon />
					</IconButton>

					<div className={styles.buttonContainer}>
						<Button
							type="reset"
							onClick={() => {
								reset();
								handleOnClose();
							}}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={!formState.isValid}
							onClick={handleOnClose}
						>
							Submit
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default DialogForm;
