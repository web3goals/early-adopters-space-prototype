// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IActivityVerifier {
    struct Status {
        bool isVerificationStarted;
        bool isVerificationFinished;
        bool isVerified;
    }

    function startVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId,
        string memory data // Assertion claim
    ) external;

    function finishVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external;

    function getVerificationStatus(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external view returns (Status memory);
}
