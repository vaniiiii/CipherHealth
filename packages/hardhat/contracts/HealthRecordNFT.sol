// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title HealthRecordNFT
 * @dev This contract represents a non-fungible token (NFT) for health records.
 * It extends the ERC721 standard and provides functionality for minting and transferring health record tokens.
 */
contract HealthRecordNFT is ERC721 {
    uint256 private tokenId;

    address public immutable cipherHealth;

    error HealthRecordNFT__ZeroAddress();
    error HealthRecordNFT__NotAuthorizedForMinting();
    error HealthRecordNFT__NotAuthorizedForTransfer();

    /**
     * @dev Modifier to restrict access to only the `cipherHealth` address.
     * Throws an error if the caller is not the `cipherHealth` address.
     */
    modifier onlyCipherHealth() {
        if (msg.sender != cipherHealth) {
            revert HealthRecordNFT__NotAuthorizedForMinting();
        }
        _;
    }

    /**
     * @dev Initializes the contract with the `cipherHealth` address.
     * @param _cipherHealth The address of the CipherHealth contract.
     */
    constructor(address _cipherHealth) ERC721("HealthRecordNFT", "HRNFT") {
        if (_cipherHealth == address(0)) {
            revert HealthRecordNFT__ZeroAddress();
        }
        cipherHealth = _cipherHealth;
    }

    /**
     * @dev Mints a new health record token and assigns it to the specified address.
     * Only the `cipherHealth` address is authorized to call this function.
     * @param to The address to which the token will be minted.
     */
    function mint(address to) external onlyCipherHealth {
        _safeMint(to, tokenId);
        unchecked {
            ++tokenId;
        }
    }

    /**
     * @dev Returns the total supply of the HealthRecordNFT tokens.
     * @return The total number of tokens in circulation.
     */
    function totalSupply() external view returns (uint256) {
        return tokenId;
    }
    /**
     * @dev Hook function that is called before any token transfer.
     * It restricts transfers to only minting and prevents transfers between addresses.
     * @param from The address from which the tokens are being transferred.
     * @param to The address to which the tokens are being transferred.
     * @param firstTokenId The ID of the first token being transferred.
     * @param batchSize The number of tokens being transferred.
     */

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize)
        internal
        virtual
        override
    {
        if (from != address(0) && to != address(0)) {
            revert HealthRecordNFT__NotAuthorizedForTransfer();
        }
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
