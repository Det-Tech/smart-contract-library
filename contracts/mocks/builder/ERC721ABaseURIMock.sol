// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../builder/ERC721A/ERC721ABaseURI.sol";

// Caller contract
contract ERC721ABaseURIMock is  ERC721ABaseURI {

    constructor( string memory _name, string memory _symbol) 
        ERC721A(_name, _symbol)
    {  
    } 

}
