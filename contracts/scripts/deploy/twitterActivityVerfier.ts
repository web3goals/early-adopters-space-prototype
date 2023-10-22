import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("👟 Start to deploy twitter activity verifier contracts");
  let oracleAddress;
  let oracleCurrency;
  if (hre.network.name === "polygonMumbai") {
    oracleAddress = "0x263351499f82C107e540B01F0Ca959843e22464a";
    oracleCurrency = "0xe6b8a5cf854791412c1f6efc7caf629f5df1c747";
  }
  if (!oracleAddress || !oracleCurrency) {
    throw new Error("Network is not supported");
  }
  const contract = await ethers.deployContract("TwitterActivityVerifier", [
    oracleAddress,
    oracleCurrency,
  ]);
  await contract.waitForDeployment();
  console.log(
    `✅ Twitter activity verifier contract deployed to ${contract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
