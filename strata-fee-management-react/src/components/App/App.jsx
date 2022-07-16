import { useState } from "react";

import { contract } from "../../web3Utils";

import styles from "./App.module.css";

import SignIn from "../SignIn/SignIn";
import StrataFeeManager from "../StrataFeeManager/StrataFeeManager";

const App = () => {
	const [userAccount, setUserAccount] = useState(null);

	const handleSignIn = (account) => {
		setUserAccount(account);
		contract.options = { ...contract.options, from: account };
		console.log(contract);
	};

	const isSignedIn = userAccount !== null;

	return (
		<div className={styles.container}>
			{isSignedIn ? (
				<StrataFeeManager account={userAccount} />
			) : (
				<SignIn onSignIn={handleSignIn} />
			)}
		</div>
	);
};

export default App;
