import Web3 from "web3";

const detectCurrentProvider = () => {
	let provider;
	if (window.ethereum) {
		provider = window.ethereum;
	} else if (window.web3) {
		// eslint-disable-next-line
		provider = window.web3.currentProvider;
	} else {
		console.log(
			"Non-Ethereum browser detected. You should consider trying MetaMask!"
		);
	}
	return provider;
};

const createWeb3Instance = () => {
	try {
		const currentProvider = detectCurrentProvider();
		if (currentProvider) {
			if (currentProvider !== window.ethereum) {
				console.log(
					"Non-Ethereum browser detected. You should consider trying MetaMask!"
				);
			}
			return new Web3(currentProvider);
		}
	} catch (err) {
		console.log(err);
	}

	return undefined;
};

const contractAddress = "0x7E63346E910aadf8aFd2aFDe4b9DfF7909048392";
const contractAbi = require("./contract.json");

export const provider = detectCurrentProvider();

export const web3 = createWeb3Instance();

export const contract = new web3.eth.Contract(contractAbi, contractAddress);

export const sendTransaction = async (
	method,
	setTransactionInProgress,
	options
) => {
	setTransactionInProgress(true);
	await method
		.send(options)
		.on("receipt", (receipt) => {
			console.log(receipt);
			setTransactionInProgress(false);
		})
		.on("error", (error) => {
			console.log(error);
			setTransactionInProgress(false);
		});
};
