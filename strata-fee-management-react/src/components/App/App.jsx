import { useState, useEffect } from "react";

import styles from "./App.module.css";

import SignIn from "../SignIn/SignIn";
import StrataFeeManager from "../StrataFeeManager/StrataFeeManager";

const App = () => {
	const [userAccount, setUserAccount] = useState(null);

	const handleSignIn = (account) => {
		setUserAccount(account);
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
