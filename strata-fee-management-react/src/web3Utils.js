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

const contractAddress = "0xf16c2a910506DeE5cc5FcD058768aB8a597AffBa";
const contractAbi = require("./contract.json");

export const provider = detectCurrentProvider();

export const web3 = createWeb3Instance();

export const contract = new web3.eth.Contract(contractAbi, contractAddress);
