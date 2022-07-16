export const detectCurrentProvider = () => {
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
