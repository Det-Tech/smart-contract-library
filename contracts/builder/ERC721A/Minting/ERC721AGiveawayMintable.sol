// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721AGiveawayMintable is ERC721A, Ownable
{
    error GiveawayArrayLengthMismatch();
    error ZeroGiveawayArrayLength();
    error ZeroAddressGiveawayMint();
    error ZeroQuantityGiveawayMint();

    modifier checkGiveawayList(address[] calldata _to, uint32[] calldata _quantity) {
        if (_to.length != _quantity.length)
            revert GiveawayArrayLengthMismatch();
        if (_to.length == 0)
            revert ZeroGiveawayArrayLength();
        for (uint256 i; i < _to.length; i++) {
            if(_to[i] == address(0)) revert ZeroAddressGiveawayMint();
            if(_quantity[i] == 0) revert ZeroQuantityGiveawayMint();

        }
        _;
    }
    // Giveaway
    function giveawayMint(address[] calldata _to, uint32[] calldata _quantity)
        public
        checkGiveawayList(_to, _quantity)
        onlyOwner
        
    {
        for (uint256 i; i < _to.length; i++) {
            _safeMint(_to[i], _quantity[i]);
        }
    }
}
