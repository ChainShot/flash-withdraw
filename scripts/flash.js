const ethers = require("ethers");
const flashbot = require("@flashbots/ethers-provider-bundle");
require("dotenv").config();

const walletAddress = "0x75dE7CFF6f6A66ddD083D7067A05046DEE5b5F85";

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);

    const funderEOA = new ethers.Wallet(process.env.FUNDER_KEY, provider);
    const compromisedEOA = new ethers.Wallet(process.env.COMPROMISED_KEY, provider);
    
    const gasPrice = ethers.utils.parseUnits("5", "gwei");

    const fundTransaction = await funderEOA.signTransaction({
        nonce: await funderEOA.getTransactionCount(),
        to: compromisedEOA.address,
        gasPrice,
        gasLimit: 21000,
        value: ethers.utils.parseEther("0.01"),
    });
    
    const abi = ["function withdraw() external"];
    const walletContract = new ethers.Contract(walletAddress, abi, compromisedEOA);

    const nonce = await compromisedEOA.getTransactionCount();
    const withdrawTx = await walletContract.populateTransaction.withdraw({
        nonce,
        gasLimit: await walletContract.estimateGas.withdraw(),
        gasPrice,
        value: 0
    });

    const safeTx = await compromisedEOA.signTransaction({
        nonce: nonce + 1,
        to: funderEOA.address,
        gasPrice,
        gasLimit: 21000,
        value: ethers.utils.parseEther("0.09")
    });

    const flashbotProvider = await flashbot.FlashbotsBundleProvider.create(
        provider,
        compromisedEOA,
        "https://relay-goerli.flashbots.net",
        "goerli"
    );

    const signedTxBundle = await flashbotProvider.signBundle([
        { 
            signedTransaction: fundTransaction
        },
        {
            signer: compromisedEOA,
            transaction: withdrawTx
        },
        {
            signedTransaction: safeTx
        }
    ]);

    const simulation = await flashbotProvider.simulate(signedTxBundle, blockNumber - 1, blockNumber);
    console.log(JSON.stringify(simulation, null, 2));

    provider.on("block", async (blockNumber) => {
        console.log("Current Block: ", blockNumber);        
        const signedBundle = await flashbotProvider.sendRawBundle(signedTxBundle, blockNumber + 1);
        const waitResponse = await signedBundle.wait();
        if(waitResponse == 0) {
            console.log("Success!");
            process.exit();
        }
    });
}

main();


