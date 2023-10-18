// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice A contract that stores profiles.
 */
contract Profile is ERC721URIStorage, Ownable {
    event URISet(uint256 indexed tokenId, string tokenURI);

    uint256 private _nextTokenId = 1;
    mapping(address => uint256) private _owners;

    constructor()
        ERC721("Early Adopters Space - Profiles", "EASP")
        Ownable(msg.sender)
    {}

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    function setURI(string memory tokenURI) public {
        // Mint token if sender does not have it yet
        if (_owners[msg.sender] == 0) {
            // Mint token
            uint256 tokenId = _nextTokenId++;
            _mint(msg.sender, tokenId);
            _owners[msg.sender] = tokenId;
            // Set URI
            _setURI(tokenId, tokenURI);
        }
        // Set URI if sender already have token
        else {
            _setURI(_owners[msg.sender], tokenURI);
        }
    }

    /// ***********************************
    /// ***** EXTERNAL VIEW FUNCTIONS *****
    /// ***********************************

    function getTokenId(address owner) external view returns (uint) {
        return _owners[owner];
    }

    function getURI(address owner) external view returns (string memory) {
        uint256 tokenId = _owners[owner];
        if (tokenId == 0) {
            return "";
        }
        return tokenURI(tokenId);
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _setURI(uint256 tokenId, string memory tokenURI) private {
        _setTokenURI(tokenId, tokenURI);
        emit URISet(tokenId, tokenURI);
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
