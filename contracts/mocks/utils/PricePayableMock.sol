// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../utils/PricePayable.sol";

// Caller contract
contract PricePayableMock is PricePayable {

    function EthPayableMultiple(uint256 _holdersMintPrice, uint256 _quantity) 
        public payable
        ethPayableMultiple(_holdersMintPrice, _quantity)
    {
    }

    function EthPayable(uint256 _quantity) 
        public payable
        ethPayable(_quantity)
    {
    }
}
