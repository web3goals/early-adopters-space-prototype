// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./IActivityVerifier.sol";

/**
 * @notice A contract that stores projects.
 */
contract TwitterActivityVerifier is IActivityVerifier {
    // TODO:
    function isCompletedActivityVerified(
        uint256 tokenId,
        uint256 activityIndex,
        uint256 completedActivityId
    ) external view returns (bool) {
        return false;
    }
}
