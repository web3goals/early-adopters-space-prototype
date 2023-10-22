import { ethers } from "hardhat";

const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";

async function main() {
  console.log("👟 Start to deploy feedback activity verifier contracts");
  const feedbackActivityVerifierContract = await ethers.deployContract(
    "FeedbackActivityVerifier"
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
    projectContract.setActivityVerifier(
      ACTIVITY_TYPE_SEND_FEEDBACK,
      feedbackActivityVerifierContract.getAddress()
    );
    console.log(`✅ Feedback activity verifier is set into project contract`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
