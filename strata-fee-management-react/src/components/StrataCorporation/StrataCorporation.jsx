import { useState, useContext, useEffect } from "react";

import styles from "./StrataCorporation.module.css";

import { contract, sendTransaction } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";

import { TransactionInProgressContext } from "../App/App";
import StrataLot from "../StrataLot/StrataLot";
import RequestExpenseForm from "../RequestExpenseForm/RequestExpenseForm";
import RequestStrataFeeChangeForm from "../RequestStrataFeeChangeForm/RequestStrataFeeChangeForm";

const StrataCorporation = ({ dailyStrataFeePerEntitlement, units }) => {
	const [isRequestExpenseOpen, setRequestExpenseOpen] = useState(false);
	const [isRequestStrataFeeChangeOpen, setRequestStrataFeeChangeOpen] =
		useState(false);
	const [lastStrataFeeCollectedDate, setLastStrataFeeCollectedDate] = useState("");
	const { setTransactionInProgress } = useContext(TransactionInProgressContext);

	const handleCollectStrataFees = async () => {
		await sendTransaction(
			contract.methods.collectStrataFeePayments(),
			setTransactionInProgress
		);
	};

	useEffect (()=>{
		(async ()=>{
			try{
				let daysFrom1970 = (await contract.methods.lastStrataFeeCollectedDate().call());
				let d = new Date(daysFrom1970 * 86400000).toDateString();
				setLastStrataFeeCollectedDate(d);
			} catch (err){
				console.log(err);
			}
		})();
	}, );
	
	return (
		<>
			<Typography className={styles.header}>
				Strata Corporation Details
			</Typography>
			<Typography className={styles.body}>
				This section is only visible if logged in using the strata account. We
				could use it to provide a UI for things that the strata needs to do
			</Typography>

			<div className={styles.dataField}>
				<Typography className={styles.label}>
					Daily Strata Fee Per Entitlement:
				</Typography>
				<Typography className={styles.value}>
					{dailyStrataFeePerEntitlement} ETH
				</Typography>
			</div>
			<div className={styles.dataField}>
				<Typography className={styles.label}>
					Last Strata Fee Collected on:
				</Typography>
				<Typography className={styles.value}>
					{lastStrataFeeCollectedDate}
				</Typography>
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
			<Container disableGutters>
				<Typography className={styles.subHeader}>Units</Typography>
				<Stack direction="row" spacing={4} className={styles.unitContainer}>
					{Object.keys(units).map((strataLotId) => {
						const unit = units[strataLotId];
						return (
							<StrataLot
								key={strataLotId}
								lotId={strataLotId}
								entitlement={unit.entitlement}
								strataFee={unit.entitlement * dailyStrataFeePerEntitlement}
								strataFeeBalance={unit.strataFeeBalance}
							/>
						);
					})}
				</Stack>
			</Container>
		</>
	);
};

export default StrataCorporation;
