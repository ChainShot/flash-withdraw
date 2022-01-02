const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Wallet", function () {
  const deposit = ethers.utils.parseEther("10");
  let wallet;
  beforeEach(async () => {
    const Wallet = await hre.ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy();
    await wallet.deployed();
    
    const signer0 = await ethers.provider.getSigner(0);
    await signer0.sendTransaction({
      value: deposit,
      to: wallet.address
    });
  });

  it("should have funds in it", async () => {
    const balance = await ethers.provider.getBalance(wallet.address);

    assert.equal(balance.toString(), deposit.toString());
  });

  describe("withdrawing", () => {
    beforeEach(async () => {
      await wallet.withdraw();
    });
  
    it("should not have funds in it", async () => {
      const balance = await ethers.provider.getBalance(wallet.address);
  
      assert.equal(balance.toString(), "0");
    });  
  });
});
