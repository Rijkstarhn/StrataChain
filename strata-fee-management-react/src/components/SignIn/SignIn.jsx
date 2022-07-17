import styles from "./SignIn.module.css";

import { web3, provider } from "../../web3Utils";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

const SignIn = ({ onSignIn }) => {
	const onConnect = async () => {
		try {
			await provider.request({ method: "eth_requestAccounts" });

			const userAccount = await web3.eth.getAccounts();
			const account = userAccount[0];
			if (userAccount.length === 0) {
				console.log("Please connect to meta mask");
			}

			onSignIn(account);
		} catch (err) {
			console.log(
				"There was an error fetching your accounts. Make sure your Ethereum client is configured correctly."
			);
		}
	};

	return (
		<Container>
			<h1>Sign In</h1>
			<Button onClick={onConnect}>Connect to MetaMask</Button>
		</Container>
	);
};

export default SignIn;
