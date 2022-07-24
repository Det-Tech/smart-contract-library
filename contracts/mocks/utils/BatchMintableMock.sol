// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../utils/BatchMintable.sol";

// Caller contract
contract BatchMintableMock is BatchMintable {

    function testMint(uint8 _quantity) 
        public virtual payable
        checkMaxBatchMint(_quantity)
    {
    }
    
    function setMaxBatchMint(uint256 _maxBatchMint) public {
        _setMaxBatchMint(_maxBatchMint);
    }

}
