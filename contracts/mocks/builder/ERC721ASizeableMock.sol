// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../builder/ERC721A/ERC721ASizeable.sol";

// Caller contract
contract ERC721ASizeableMock is  ERC721ASizeable {

    constructor( string memory _name, string memory _symbol, uint256 _maxSupply) 
        ERC721A(_name, _symbol)
        ERC721ASizeable(_maxSupply)
    {  
        
    }
    
}
