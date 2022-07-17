import { useState, createContext } from "react";

import { contract } from "../../web3Utils";

import styles from "./App.module.css";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";

import SignIn from "../SignIn/SignIn";
import StrataFeeManager from "../StrataFeeManager/StrataFeeManager";

export const TransactionInProgressContext = createContext();

const App = () => {
	const [userAccount, setUserAccount] = useState(null);
	const [isTransactionInProgress, setTransactionInProgress] = useState(false);

	const handleSignIn = (account) => {
		setUserAccount(account);
		contract.options = { ...contract.options, from: account };
		console.log(contract);
	};

	const isSignedIn = userAccount !== null;

	return (
		<>
			<Container>
				<TransactionInProgressContext.Provider
					value={{ isTransactionInProgress, setTransactionInProgress }}
				>
					{isSignedIn ? (
						<StrataFeeManager account={userAccount} />
					) : (
						<SignIn onSignIn={handleSignIn} />
					)}
				</TransactionInProgressContext.Provider>
			</Container>
			<Backdrop
				sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={isTransactionInProgress}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</>
	);
};

export default App;
