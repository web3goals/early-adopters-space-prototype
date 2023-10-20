// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IActivityVerifier {
    function isCompletedActivityVerified(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external view returns (bool);
}
