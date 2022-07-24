// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";

abstract contract ERC721ASizeable is ERC721A
{
    // Constants
    uint256 public maxSupply;

    error MaxSupplyExceeeded();
    constructor(uint256 _maxSupply)
    {
        maxSupply = _maxSupply;
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256,
        uint256 quantity
    ) internal virtual override {

        // When minting, check if it exceeds max supply
        if (from == address(0) && to != address(0)) {
            uint256 remainingSupply = maxSupply - totalSupply();
            if (remainingSupply < quantity)
                revert MaxSupplyExceeeded();
        }
    }
}
