import { ethers } from "hardhat";

async function main() {
  console.log("👟 Start to deploy UMA activity verifier contracts");
  const contract = await ethers.deployContract("UmaActivityVerifier", [
    "0xe6b8a5cf854791412c1f6efc7caf629f5df1c747",
  ]);
  await contract.waitForDeployment();
  console.log(
    `✅ UMA activity verifier contract deployed to ${contract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
