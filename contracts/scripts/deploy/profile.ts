import { ethers } from "hardhat";

async function main() {
  console.log("👟 Start to deploy profile contract");
  const contract = await ethers.deployContract("Profile");
  await contract.waitForDeployment();
  console.log(`✅ Contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
