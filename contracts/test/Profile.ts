import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Profile", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo] = await ethers.getSigners();
    // Deploy contract
    const contractFactory = await ethers.getContractFactory("Profile");
    const contract = await contractFactory.deploy();
    return {
      deployer,
      userOne,
      userTwo,
      contract,
    };
  }

  it("Should allow a user to have only one token", async function () {
    const { userOne, contract } = await loadFixture(initFixture);
    // First try
    await expect(contract.connect(userOne).setURI("ipfs://1")).to.be.not
      .reverted;
    expect(await contract.balanceOf(userOne)).to.be.equal(1);
    // Second try
    await expect(contract.connect(userOne).setURI("ipfs://2")).to.be.not
      .reverted;
    expect(await contract.balanceOf(userOne)).to.be.equal(1);
  });

  it("Should disallow a user to transfer his token", async function () {
    const { userOne, userTwo, contract } = await loadFixture(initFixture);
    // Create token
    await expect(contract.connect(userOne).setURI("ipfs://1")).to.be.not
      .reverted;
    expect(await contract.balanceOf(userOne)).to.be.equal(1);
    const tokenId = await contract.getTokenId(userOne.address);
    // Transfer
    await expect(
      contract
        .connect(userOne)
        .transferFrom(userOne.address, userTwo.address, tokenId)
    ).to.be.revertedWith("Token not transferable");
  });
});
