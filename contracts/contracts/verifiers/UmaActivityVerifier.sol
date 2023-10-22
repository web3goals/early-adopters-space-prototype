// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./OptimisticOracleV3Interface.sol";

// This contract shows how to get up and running as quickly as possible with UMA's Optimistic Oracle V3.
// We make a simple data assertion about the real world and let the OOV3 arbitrate the outcome.

contract UmaActivityVerifier {
    // Create an Optimistic Oracle V3 instance at the deployed address on Görli.
    // OptimisticOracleV3Interface oov3 =
    //     OptimisticOracleV3Interface(0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB);
    OptimisticOracleV3Interface oov3;

    // Asserted claim. This is some truth statement about the world and can be verified by the network of disputers.
    bytes public assertedClaim =
        bytes("Argentina won the 2022 Fifa world cup in Qatar");

    address public defaultCurrency;

    struct Status {
        bool isVerificationStarted;
        bool isVerificationFinished;
        bool isVerified;
        bytes32 assertionId;
    }

    // TODO: Use this field
    mapping(uint projectId => mapping(uint256 activityIndex => mapping(string completedActivityId => Status))) statuses;

    constructor(address oracleDefaultCurrency) {
        defaultCurrency = oracleDefaultCurrency;
        oov3 = OptimisticOracleV3Interface(
            0x263351499f82C107e540B01F0Ca959843e22464a
        );
    }

    // Each assertion has an associated assertionID that uniquly identifies the assertion. We will store this here.
    bytes32 public assertionId; // TODO: Delete

    // Assert the truth against the Optimistic Asserter. This uses the assertion with defaults method which defaults
    // all values, such as a) challenge window to 120 seconds (2 mins), b) identifier to ASSERT_TRUTH, c) bond currency
    //  to USDC and c) and default bond size to 0 (which means we dont need to worry about approvals in this example).
    function assertTruth() public {
        assertionId = oov3.assertTruthWithDefaults(
            assertedClaim,
            address(this)
        );
    }

    function assertTruthCustom() public {
        assertionId = oov3.assertTruth(
            assertedClaim,
            address(this), // asserter
            address(0), // callbackRecipient
            address(0), // escalationManager
            // 7200, // 120 minutes
            120, // 2 minutes
            IERC20(defaultCurrency), // matic
            oov3.getMinimumBond(defaultCurrency),
            0x4153534552545f54525554480000000000000000000000000000000000000000,
            bytes32(0)
        );
    }

    // Settle the assertion, if it has not been disputed and it has passed the challenge window, and return the result.
    // result
    function settleAndGetAssertionResult() public returns (bool) {
        return oov3.settleAndGetAssertionResult(assertionId);
    }

    // Just return the assertion result. Can only be called once the assertion has been settled.
    function getAssertionResult() public view returns (bool) {
        return oov3.getAssertionResult(assertionId);
    }

    // Return the full assertion object contain all information associated with the assertion. Can be called any time.
    function getAssertion()
        public
        view
        returns (OptimisticOracleV3Interface.Assertion memory)
    {
        return oov3.getAssertion(assertionId);
    }
}
