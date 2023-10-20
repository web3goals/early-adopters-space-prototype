import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe.only("Project", function () {
  const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";
  const ACTIVITY_TYPE_FOLLOW_TWITTER = "FOLLOW_TWITTER";

  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy project contract
    const projectContractFactory = await ethers.getContractFactory("Project");
    const projectContract = await projectContractFactory.deploy();
    // Deploy feedback verifier
    const feedbackActivityVerifierContractFactory =
      await ethers.getContractFactory("FeedbackActivityVerifier");
    const feedbackActivityVerifierContract =
      await feedbackActivityVerifierContractFactory.deploy();
    // Deploy twitter verifier
    const twitterActivityVerifierContractFactory =
      await ethers.getContractFactory("TwitterActivityVerifier");
    const twitterActivityVerifierContract =
      await twitterActivityVerifierContractFactory.deploy();
    // Set verifiers
    projectContract.setActivityVerifier(
      ACTIVITY_TYPE_SEND_FEEDBACK,
      feedbackActivityVerifierContract.getAddress()
    );
    projectContract.setActivityVerifier(
      ACTIVITY_TYPE_FOLLOW_TWITTER,
      twitterActivityVerifierContract.getAddress()
    );
    return {
      deployer,
      userOne,
      userTwo,
      userThree,
      projectContract,
    };
  }

  it("Should support the main flow", async function () {
    const { userOne, userTwo, userThree, projectContract } = await loadFixture(
      initFixture
    );
    // Create project
    await expect(projectContract.connect(userOne).create("ipfs://project_1")).to
      .be.not.reverted;
    const tokenId = (await projectContract.getNextTokenId()) - 1n;
    expect(tokenId).to.be.equal(1);
    // Add activities
    await expect(
      projectContract
        .connect(userOne)
        .addActivity(tokenId, ACTIVITY_TYPE_SEND_FEEDBACK, "ipfs://activity_1")
    ).to.be.not.reverted;
    await expect(
      projectContract
        .connect(userOne)
        .addActivity(tokenId, ACTIVITY_TYPE_FOLLOW_TWITTER, "ipfs://activity_2")
    ).to.be.not.reverted;
    expect((await projectContract.getActivities(tokenId)).length).to.be.equal(
      2
    );
    // Check completed activity verification status
    const completedActivityIdOne = 42;
    const completedActivityIdTwo = 43;
    const feedbackActivityIndex = 0;
    const twitterActivityIndex = 1;
    expect(
      await projectContract.isCompletedActivityVerified(
        tokenId,
        feedbackActivityIndex,
        completedActivityIdOne
      )
    ).to.be.equal(true);
    expect(
      await projectContract.isCompletedActivityVerified(
        tokenId,
        twitterActivityIndex,
        completedActivityIdOne
      )
    ).to.be.equal(false);
    expect(
      await projectContract.isAuthorOfAcceptedCompletedActivity(
        tokenId,
        userTwo
      )
    ).to.be.equal(false);
    // Accept activities
    await expect(
      projectContract
        .connect(userOne)
        .acceptCompletedActivity(
          tokenId,
          feedbackActivityIndex,
          completedActivityIdOne,
          userTwo
        )
    ).to.be.not.reverted;
    await expect(
      projectContract
        .connect(userOne)
        .acceptCompletedActivity(
          tokenId,
          feedbackActivityIndex,
          completedActivityIdTwo,
          userThree
        )
    ).to.be.not.reverted;
    expect(
      (
        await projectContract.getAcceptedCompletedActivities(
          tokenId,
          feedbackActivityIndex
        )
      ).length
    ).to.be.equal(2);
    expect(
      await projectContract.isAuthorOfAcceptedCompletedActivity(
        tokenId,
        userTwo
      )
    ).to.be.equal(true);
    // Distribute reward
    await expect(
      projectContract
        .connect(userOne)
        .distributeReward(tokenId, "ipfs://reward_1", {
          value: ethers.parseEther("0.1"),
        })
    ).to.changeEtherBalances(
      [userOne, userTwo, userThree],
      [
        ethers.parseEther("-0.1"),
        ethers.parseEther("0.05"),
        ethers.parseEther("0.05"),
      ]
    );
  });
});
