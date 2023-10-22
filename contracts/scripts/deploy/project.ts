import { ethers } from "hardhat";

async function main() {
  console.log("👟 Start to deploy project contract");
  // Deploy project contract
  const contract = await ethers.deployContract("Project", [10]);
  await contract.waitForDeployment();
  console.log(`✅ Project contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
