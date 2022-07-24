// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../builder/ERC721A/ERC721ARoyalty.sol";

// Caller contract
contract ERC721ARoyaltyMock is ERC721ARoyalty {
    
    constructor( string memory _name, string memory _symbol) 
        ERC721A(_name, _symbol)
    {  
        
    }

}
