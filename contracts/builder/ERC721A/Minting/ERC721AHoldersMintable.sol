// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "../../../utils/PricePayable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract ERC721AHoldersMintable is ERC721A, Ownable, PricePayable
{
    IERC721 private tokenContract;

    uint256 public holdersMintSupply;
    uint256 public holdersMintQuantity;

    uint256 public holdersMintPrice;

    error NotHoldingToken();
    error InvalidHolder(uint256 id, address owner);
    error HoldersMintSoldOut();
    error ZeroTokenContractAddress();

    modifier checkHolding(uint256[] memory _tokenIds) {
        if (_tokenIds.length == 0)
            revert NotHoldingToken();
        for (uint256 i; i < _tokenIds.length; i++) {
            if (tokenContract.ownerOf(_tokenIds[i]) != msg.sender)
                revert InvalidHolder(_tokenIds[i], _msgSender());
        }
        _;
    }

    modifier checkHoldersMintQuantity(uint256 _quantity) {
        if (holdersMintSupply != 0){
            // Checking if the required quantity of tokens still remains
            uint256 remainingSupply = holdersMintSupply - holdersMintQuantity;
            if (_quantity > remainingSupply)
                revert HoldersMintSoldOut();
            _;
        }
        _;
    }

    modifier checkTokenContractAddress(address _tokenContract) {
        if (_tokenContract == address(0)){
            revert ZeroTokenContractAddress();
        }
        _;
    }

    // Holders Minting
    function holdersMint(uint256[] memory _tokenIds, uint256 _quantity) 
        public virtual payable
        checkHolding(_tokenIds)
        checkHoldersMintQuantity(_quantity)
        ethPayableMultiple(holdersMintPrice, _quantity)
    {
        holdersMintQuantity += _quantity;
        _safeMint(_msgSender(), _quantity);
    }

    function setTokenContract(address _tokenContract) public onlyOwner checkTokenContractAddress(_tokenContract){
        tokenContract = IERC721(_tokenContract);
    }

    function setHoldersMintSupply(uint256 _holdersMintSupply) public onlyOwner {
        holdersMintQuantity = 0;
        holdersMintSupply = _holdersMintSupply;
    }

    function setHoldersMintPrice(uint256 _holdersMintPrice) public onlyOwner {
        holdersMintPrice = _holdersMintPrice;
    }
}
