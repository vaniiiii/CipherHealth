// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HealthRecordNFT is ERC721 {
	uint256 private tokenId;

	address public immutable cipherHealth;

	error CipherHealth__NotAuthorizedForMinting();
	error CipherHealth__NotAuthorizedForTransfer();

	modifier onlyCipherHealth() {
		if (msg.sender != cipherHealth)
			revert CipherHealth__NotAuthorizedForMinting();
		_;
	}

	constructor(address _cipherHealth) ERC721("HealthRecordNFT", "HRNFT") {
		cipherHealth = _cipherHealth;
	}

	function mint(address to) external onlyCipherHealth {
		_safeMint(to, tokenId);
		unchecked {
			++tokenId;
		}
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 firstTokenId,
		uint256 batchSize
	) internal virtual override {
		if (from != address(0) && to != address(0)) {
			revert CipherHealth__NotAuthorizedForTransfer();
		}
		super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
	}
}
