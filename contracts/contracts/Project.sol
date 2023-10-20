// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./verifiers/IActivityVerifier.sol";

/**
 * @notice A contract that stores projects.
 */
contract Project is ERC721URIStorage, Ownable {
    struct Activity {
        string activityType;
        string activityDetailsURI;
    }

    struct CompletedActivity {
        string completedActivityId;
        address completedActivityAuthorAddress;
    }

    struct Reward {
        uint rewardValue;
        uint rewardRecepientsNumber;
        string rewardDetailsURI;
        bool isDistributed;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint tokenId => Activity[]) private _projectActivities;
    mapping(uint tokenId => mapping(uint activityIndex => CompletedActivity[]))
        private _projectAcceptedCompletedActivites;
    mapping(uint256 tokenId => Reward) private _projectRewards;
    mapping(string activityType => address) private _activityVerifiers;

    constructor()
        ERC721("Early Adopters Space - Projects", "EASP")
        Ownable(msg.sender)
    {}

    modifier onlyTokenOwner(uint256 tokenId) {
        if (_ownerOf(tokenId) != msg.sender) {
            revert("Not token owner");
        }
        _;
    }

    /// ************************************
    /// ***** CONTRACT OWNER FUNCTIONS *****
    /// ************************************

    function setActivityVerifier(
        string memory activityType,
        address activityVerifier
    ) external onlyOwner {
        _activityVerifiers[activityType] = activityVerifier;
    }

    /// ***********************************
    /// ***** PROJECT OWNER FUNCTIONS *****
    /// ***********************************

    function create(string memory tokenURI) external {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function addActivity(
        uint256 tokenId,
        string memory activityType,
        string memory activityDetailsURI
    ) external onlyTokenOwner(tokenId) {
        require(
            _activityVerifiers[activityType] != address(0),
            "Activity verifier is not defined"
        );
        _projectActivities[tokenId].push(
            Activity(activityType, activityDetailsURI)
        );
    }

    // TODO:
    function verifyCompletedActivity(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external onlyTokenOwner(tokenId) {}

    function acceptCompletedActivity(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId,
        address completedActivityAuthorAddress
    ) external onlyTokenOwner(tokenId) {
        require(
            _isCompletedActivityVerified(
                tokenId,
                activityIndex,
                completedActivityId
            ),
            "Completed activity is not verified"
        );
        _projectAcceptedCompletedActivites[tokenId][activityIndex].push(
            CompletedActivity(
                completedActivityId,
                completedActivityAuthorAddress
            )
        );
    }

    function distributeReward(
        uint256 tokenId,
        string memory rewardDetailsURI
    ) external payable onlyTokenOwner(tokenId) {
        require(
            !_projectRewards[tokenId].isDistributed,
            "Reward is already distributed"
        );
        // Define reward recipients number
        uint rewardRecipientsNumber = 0;
        for (uint256 i = 0; i < _projectActivities[tokenId].length; i++) {
            rewardRecipientsNumber += _projectAcceptedCompletedActivites[
                tokenId
            ][i].length;
        }
        require(rewardRecipientsNumber != 0, "No reward recipients");
        // Distribute reward
        for (uint256 i = 0; i < _projectActivities[tokenId].length; i++) {
            for (
                uint256 j = 0;
                j < _projectAcceptedCompletedActivites[tokenId][i].length;
                j++
            ) {
                (bool sent, ) = _projectAcceptedCompletedActivites[tokenId][i][
                    j
                ].completedActivityAuthorAddress.call{
                    value: msg.value / rewardRecipientsNumber
                }("");
                require(sent, "Failed to send reward");
            }
        }
        _projectRewards[tokenId] = Reward(
            msg.value,
            rewardRecipientsNumber,
            rewardDetailsURI,
            true
        );
    }

    /// ***********************************
    /// ***** EXTERNAL VIEW FUNCTIONS *****
    /// ***********************************

    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function getActivityVerifier(
        string memory activityType
    ) external view returns (address) {
        return _activityVerifiers[activityType];
    }

    function getActivities(
        uint256 tokenId
    ) external view returns (Activity[] memory) {
        return _projectActivities[tokenId];
    }

    function getAcceptedCompletedActivities(
        uint256 tokenId,
        uint256 activityIndex
    ) external view returns (CompletedActivity[] memory) {
        return _projectAcceptedCompletedActivites[tokenId][activityIndex];
    }

    function getReward(uint256 tokenId) external view returns (Reward memory) {
        return _projectRewards[tokenId];
    }

    function isCompletedActivityVerified(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external view returns (bool) {
        return
            _isCompletedActivityVerified(
                tokenId,
                activityIndex,
                completedActivityId
            );
    }

    function isCompletedActivityAccepted(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId
    ) external view returns (bool) {
        for (
            uint256 i = 0;
            i <
            _projectAcceptedCompletedActivites[tokenId][activityIndex].length;
            i++
        ) {
            if (
                keccak256(
                    abi.encodePacked(
                        _projectAcceptedCompletedActivites[tokenId][
                            activityIndex
                        ][i].completedActivityId
                    )
                ) == keccak256(abi.encodePacked(completedActivityId))
            ) {
                return true;
            }
        }
        return false;
    }

    function isAuthorOfAcceptedCompletedActivity(
        uint256 tokenId,
        address account
    ) external view returns (bool) {
        for (uint256 i = 0; i < _projectActivities[tokenId].length; i++) {
            for (
                uint256 j = 0;
                j < _projectAcceptedCompletedActivites[tokenId][i].length;
                j++
            ) {
                if (
                    _projectAcceptedCompletedActivites[tokenId][i][j]
                        .completedActivityAuthorAddress == account
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _isCompletedActivityVerified(
        uint256 tokenId,
        uint256 activityIndex,
        string memory completedActivityId
    ) internal view returns (bool) {
        require(
            _projectActivities[tokenId].length > activityIndex,
            "Activity index is not correct"
        );
        Activity memory activity = _projectActivities[tokenId][activityIndex];
        require(
            _activityVerifiers[activity.activityType] != address(0),
            "Activity verifier is not defined"
        );
        return
            IActivityVerifier(_activityVerifiers[activity.activityType])
                .isCompletedActivityVerified(
                    tokenId,
                    activityIndex,
                    completedActivityId
                );
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721) returns (address) {
        // Disable updates except minting
        if (_ownerOf(tokenId) != address(0)) {
            revert("Token not transferable");
        }
        // Process next transfer
        return super._update(to, tokenId, auth);
    }
}
