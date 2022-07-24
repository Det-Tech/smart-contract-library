// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../royalty/Royalty.sol";

// Caller contract
contract RoyaltyMock is Royalty {

    function setRoyaltyReceiver(address _address) public {
        _setRoyaltyReceiver(_address);
    }

    function setRoyaltyBasisPoints(uint32 _basisPoints) public {
        _setRoyaltyBasisPoints(_basisPoints);
    }
    
}
