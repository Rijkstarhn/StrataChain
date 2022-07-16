import { useState } from "react";

import styles from "./StrataLot.module.css";

import { web3, contract } from "../../web3Utils";

const StrataLot = ({
	lotId,
	entitlement,
	strataFee,
	strataFeeBalance,
	ownership
}) => {
	const [transferOwnerAddress, setTransferOwnerAddress] = useState("");
	const [strataFeePaymentAmount, setStrataFeePaymentAmount] = useState(0);

	const handlePayStrataFee = async (amount) => {
		const weiToSend = web3.utils.toWei(amount, "ether");
		console.log(weiToSend);
		console.log(contract.methods);
		await contract.methods.payStrataFee(lotId).send({ value: weiToSend });
	};

	const handleTransferOwner = async (newOwnerAccount) => {
		await contract.methods.transferOwner(lotId, newOwnerAccount).send();
	};

	return (
		<div className={styles.unitContainer}>
			<div className={styles.dataField}>
				<span className={styles.label}>Lot ID: </span>
				{lotId}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Current Owner: </span>
				{ownership.owner.account}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Entitlement: </span>
				{entitlement}
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Monthly Strata Fee: </span>
				{strataFee} ETH
			</div>
			<div className={styles.dataField}>
				<span className={styles.label}>Balance Owed: </span>
				{web3.utils.fromWei(strataFeeBalance, "ether")} ETH
			</div>

			<div className={styles.dataField}>
				<button onClick={() => handlePayStrataFee(strataFeePaymentAmount)}>
					Pay Strata Fee
				</button>
				<input
					id={`pay-strata-fee-${lotId}`}
					type="number"
					onChange={(e) => {
						setStrataFeePaymentAmount(e.target.value);
					}}
				/>
			</div>

			<div className={styles.dataField}>
				<button onClick={() => handleTransferOwner(transferOwnerAddress)}>
					Transfer Owner
				</button>
				<input
					id={`transfer-owner-${lotId}`}
					type="text"
					onChange={(e) => {
						setTransferOwnerAddress(e.target.value);
					}}
				/>
			</div>
		</div>
	);
};

export default StrataLot;
