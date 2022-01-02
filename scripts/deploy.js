const initialFunds = ethers.utils.parseEther("0.1");

async function main() {
  const randomWallet = (ethers.Wallet.createRandom()).connect(ethers.provider);

  console.log("Private key generated", randomWallet.privateKey, "with an address", randomWallet.address);

  const signer0 = await ethers.provider.getSigner(0);
  const tx1 = await signer0.sendTransaction({
    value: initialFunds,
    to: randomWallet.address,
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    nonce: await signer0.getTransactionCount()
  });
  await tx1.wait();

  console.log("Random wallet funded", await ethers.provider.getBalance(randomWallet.address));

  const WalletContract = await hre.ethers.getContractFactory("Wallet", randomWallet);
  const walletContract = await WalletContract.deploy();
  await walletContract.deployed();

  console.log("Wallet Contract deployed to", walletContract.address);

  const gasPrice = ethers.utils.parseUnits("5", "gwei");
  const gasLimit = await ethers.provider.estimateGas({
    value: initialFunds.div(2),
    to: walletContract.address
  });
  const balance = await ethers.provider.getBalance(randomWallet.address);
  const tx2 = await randomWallet.sendTransaction({
    value: balance.sub(gasPrice.mul(gasLimit)),
    to: walletContract.address,
    gasPrice,
    gasLimit,
  });
  await tx2.wait();

  console.log("Wallet Contract Funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
