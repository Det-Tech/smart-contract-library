// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "../../../utils/PricePayable.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721AWhitelistMintable is 
    ERC721A, Ownable, PricePayable
{
    // Whitelist params
    uint256 public whitelistMintSupply;
    uint256 public whitelistMintQuantity;

    uint256 public whitelistMintPrice;

    bytes32 public merkleRoot;
    
    error ProofFailed();
    error WhitelistMintSoldOut();

    modifier checkMerkleProof(bytes32[] calldata _merkleProof) {
        bool proofVerified = MerkleProof.verify(
            _merkleProof,
            merkleRoot,
            keccak256(abi.encodePacked(_msgSender()))
        );
        if (!proofVerified)
            revert ProofFailed();
        _;
    }

    modifier checkWhitelistMintQuantity(uint8 _quantity) {
        if (whitelistMintSupply != 0){
            // Checking if the required quantity of tokens still remains
            uint256 remainingSupply = whitelistMintSupply - whitelistMintQuantity;
            if (_quantity > remainingSupply)
                revert WhitelistMintSoldOut();
            _;
        }
        _;
    }

    // Whitelist Mint
    function whitelistMint(bytes32[] calldata _merkleProof, uint8 _quantity) 
        public virtual payable 
        checkMerkleProof(_merkleProof) 
        checkWhitelistMintQuantity(_quantity)
        ethPayableMultiple(whitelistMintPrice, _quantity)
    {
        whitelistMintQuantity += _quantity;
        _safeMint(_msgSender(), _quantity);
    }

    // Set Merle Root
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function setWhitelistMintSupply(uint256 _whitelistMintSupply) public onlyOwner {
        whitelistMintQuantity = 0;
        whitelistMintSupply = _whitelistMintSupply;
    }

    function setWhitelistMintPrice(uint256 _whitelistMintPrice) public onlyOwner {
        whitelistMintPrice = _whitelistMintPrice;
    }
}
