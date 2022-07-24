// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "erc721a/contracts/ERC721A.sol";

abstract contract ERC721AReservedMintable is ERC721A, Ownable
{
    // Reserved
    uint256 public reservedMintSupply;
    uint256 public reservedMintQuantity;

    error ReservedMintedOut();
    error ReserveLimitExceeded();
    error ZeroReservedMintAddress();

    modifier checkReservedMintQuantity(uint256 _quantity) {
        if (reservedMintSupply != 0){
            // Checking if the required quantity of tokens still remains
            uint256 remainingSupply = reservedMintSupply - reservedMintQuantity;
            if (_quantity > remainingSupply)
                revert ReservedMintedOut();
            _;
        }
        _;
    }

    modifier checkAddressReservedMint(address _to) {
        if (_to == address(0)){
            revert ZeroReservedMintAddress();
        }
        _;
    }

    function setReservedMintSupply(uint256 _reservedMintSupply) public onlyOwner {
        reservedMintQuantity = 0;
        reservedMintSupply = _reservedMintSupply;
    }

    // Reserved Mint
    function reservedMint(address _to, uint256 _quantity) 
        public onlyOwner 
        checkReservedMintQuantity(_quantity)
        checkAddressReservedMint(_to)
    {
        reservedMintQuantity += _quantity;
        _safeMint(_to, _quantity);
    }
}
