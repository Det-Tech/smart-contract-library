// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "erc721a/contracts/ERC721A.sol";
import "../../royalty/Royalty.sol";

abstract contract ERC721ARoyalty is ERC721A, Ownable, Royalty
{   
    error ZeroReceiverAddress();
    error ZeroReceiverBasisPoints();

    modifier checkReceiverAddress(address _to) {
        if (_to == address(0)){
            revert ZeroReceiverAddress();
        }
        _;
    }

    modifier checkReceiverBasisPoints(uint32 _basisPoints) {
        if (_basisPoints == 0){
            revert ZeroReceiverBasisPoints();
        }
        _;
    }

    function setRoyaltyReceiver(address _address) public onlyOwner checkReceiverAddress(_address){
        _setRoyaltyReceiver(_address);
    }
    
    function setRoyaltyBasisPoints(uint32 _basisPoints) public onlyOwner checkReceiverBasisPoints(_basisPoints) {
        _setRoyaltyBasisPoints(_basisPoints);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721A, Royalty)
        returns (bool)
    {
        return
            interfaceId == type(Royalty).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
