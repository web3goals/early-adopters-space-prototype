import { ethers } from "hardhat";
import hre from "hardhat";
import { DeployContractOptions } from "@nomicfoundation/hardhat-ethers/types";

const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";

async function main() {
  console.log("👟 Start to deploy feedback activity verifier contracts");
  let options: DeployContractOptions | undefined;
  if (hre.network.name === "filecoinCalibration") {
    options = {
      maxFeePerGas: 100,
      maxPriorityFeePerGas: 100,
      gasLimit: 200_000_000,
    };
  }
  if (hre.network.name === "mantleTestnet") {
    options = {
      gasLimit: 10_000_000,
    };
  }
  const feedbackActivityVerifierContract = await ethers.deployContract(
    "FeedbackActivityVerifier",
    options
  );
  await feedbackActivityVerifierContract.waitForDeployment();
  console.log(
    `✅ Feedback activity verifier contract deployed to ${feedbackActivityVerifierContract.target}`
  );
  const projectContractAddress = "";
  if (projectContractAddress) {
    const projectContract = await ethers.getContractAt(
      "Project",
      projectContractAddress
    );
    await projectContract.setActivityVerifier(
      ACTIVITY_TYPE_SEND_FEEDBACK,
      feedbackActivityVerifierContract.getAddress(),
      {}
    );
    console.log(`✅ Feedback activity verifier is set into project contract`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
