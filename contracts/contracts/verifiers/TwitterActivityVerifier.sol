// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./OptimisticOracleV3Interface.sol";

contract TwitterActivityVerifier {
    OptimisticOracleV3Interface oov3;
    address public oov3currency;

    struct Status {
        bool isVerificationStarted;
        bool isVerificationFinished;
        bool isVerified;
    }

    mapping(uint projectId => mapping(uint256 activityIndex => mapping(string completedActivityId => Status status))) statuses;
    mapping(uint projectId => mapping(uint256 activityIndex => mapping(string completedActivityId => bytes32 assertionId))) assertionIds;

    constructor(address oracleAddress, address oracleCurrency) {
        oov3 = OptimisticOracleV3Interface(oracleAddress);
        oov3currency = oracleCurrency;
    }

    function startVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId,
        string memory data // Assertion claim
    ) public {
        bytes32 assertionId = oov3.assertTruth(
            bytes(data),
            address(this),
            address(0),
            address(0),
            120, // 2 minutes
            IERC20(oov3currency),
            oov3.getMinimumBond(oov3currency),
            0x4153534552545f54525554480000000000000000000000000000000000000000,
            bytes32(0)
        );
        assertionIds[projectId][activityIndex][
            completedActivityId
        ] = assertionId;
        statuses[projectId][activityIndex][completedActivityId] = Status(
            true,
            false,
            false
        );
    }

    function finishVerify(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) public {
        bytes32 assertionId = assertionIds[projectId][activityIndex][
            completedActivityId
        ];
        bool assertionResult = oov3.settleAndGetAssertionResult(assertionId);
        statuses[projectId][activityIndex][completedActivityId]
            .isVerificationFinished = true;
        statuses[projectId][activityIndex][completedActivityId]
            .isVerified = assertionResult;
    }

    function getVerificationStatus(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) public view returns (Status memory) {
        return statuses[projectId][activityIndex][completedActivityId];
    }

    function getAssertionId(
        uint256 projectId,
        uint256 activityIndex,
        string memory completedActivityId
    ) public view returns (bytes32) {
        return assertionIds[projectId][activityIndex][completedActivityId];
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getAssertionResult(
        bytes32 assertionId
    ) public view returns (bool) {
        return oov3.getAssertionResult(assertionId);
    }

    // Return the full assertion object contain all information associated with the assertion. Can be called any time.
    function getAssertion(
        bytes32 assertionId
    ) public view returns (OptimisticOracleV3Interface.Assertion memory) {
        return oov3.getAssertion(assertionId);
    }
}
