import { ethers } from "hardhat";

const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";

async function main() {
  console.log("👟 Start to deploy project and activity verifiers contracts");
  // Deploy project contract
  const projectContract = await ethers.deployContract("Project");
  await projectContract.waitForDeployment();
  console.log(`✅ Project contract deployed to ${projectContract.target}`);
  // Deploy feedback activity verifier contract
  const feedbackActivityVerifierContract = await ethers.deployContract(
    "FeedbackActivityVerifier"
  );
  await feedbackActivityVerifierContract.waitForDeployment();
  console.log(
    `✅ Feedback activity verifier contract deployed to ${feedbackActivityVerifierContract.target}`
  );
  // Set activity verifiers
  projectContract.setActivityVerifier(
    ACTIVITY_TYPE_SEND_FEEDBACK,
    feedbackActivityVerifierContract.getAddress()
  );
  console.log(`✅ Activities are set`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
