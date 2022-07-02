import Web3 from "web3";

import styles from "./SignIn.module.css";

import { detectCurrentProvider } from "../../web3Utils";

const SignIn = ({ onSignIn }) => {
	const onConnect = async () => {
		try {
			const currentProvider = detectCurrentProvider();
			if (currentProvider) {
				if (currentProvider !== window.ethereum) {
					console.log(
						"Non-Ethereum browser detected. You should consider trying MetaMask!"
					);
				}
				await currentProvider.request({ method: "eth_requestAccounts" });
				const web3 = new Web3(currentProvider);
				const userAccount = await web3.eth.getAccounts();
				const account = userAccount[0];
				if (userAccount.length === 0) {
					console.log("Please connect to meta mask");
				}

				onSignIn(account);
			}
		} catch (err) {
			console.log(
				"There was an error fetching your accounts. Make sure your Ethereum client is configured correctly."
			);
		}
	};

	return (
		<div>
			<div>
				<h1>Sign In</h1>
			</div>
			<div>
				<div>
					<button onClick={onConnect}>Connect to MetaMask</button>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
