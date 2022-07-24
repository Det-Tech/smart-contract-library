// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "../../../utils/BatchMintable.sol";
import "../../../utils/PricePayable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721APublicMintable is 
    ERC721A, Ownable, BatchMintable, PricePayable
{
    uint256 public publicMintSupply;
    uint256 public publicMintQuantity;

    uint256 public publicMintPrice;

    error PublicMintSoldOut();

    modifier checkPublicMintQuantity(uint8 _quantity) {
        if (publicMintSupply != 0){
            // Checking if the required quantity of tokens still remains
            uint256 remainingSupply = publicMintSupply - publicMintQuantity;
            if (_quantity > remainingSupply)
                revert PublicMintSoldOut();
            _;
        }
        _;
    }

    // Public Minting
    function publicMint(uint8 _quantity) 
        public virtual payable 
        checkMaxBatchMint(_quantity)
        checkPublicMintQuantity(_quantity)
        ethPayableMultiple(publicMintPrice, _quantity)
    {        
        publicMintQuantity += _quantity;
        _safeMint(_msgSender(), _quantity);
    }

    function setMaxBatchMint(uint256 _maxBatchMint) public onlyOwner {
        _setMaxBatchMint(_maxBatchMint);
    }

    function setPublicMintSupply(uint256 _publicMintSupply) public onlyOwner {
        publicMintQuantity = 0;
        publicMintSupply = _publicMintSupply;
    }

    function setPublicMintPrice(uint256 _publicMintPrice) public onlyOwner {
        publicMintPrice = _publicMintPrice;
    }
}
