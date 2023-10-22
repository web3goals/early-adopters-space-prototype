// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./IActivityVerifier.sol";

/**
 * @notice A contract that stores projects.
 */
contract FeedbackActivityVerifier is IActivityVerifier {
    function startVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId,
        string memory data // Assertion claim
    ) external {}

    function finishVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external {}

    function getVerificationStatus(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external view returns (Status memory) {
        return IActivityVerifier.Status(true, true, true);
    }
}
