import { ethers } from "hardhat";
import hre from "hardhat";
import { DeployContractOptions } from "@nomicfoundation/hardhat-ethers/types";

async function main() {
  console.log("👟 Start to deploy profile contract");
  let options: DeployContractOptions | undefined;
  if (hre.network.name === "filecoinCalibration") {
    options = {
      maxFeePerGas: 100,
      maxPriorityFeePerGas: 100,
      gasLimit: 10_000_000,
    };
  }
  const contract = await ethers.deployContract("Profile", options);
  await contract.waitForDeployment();
  console.log(`✅ Contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
