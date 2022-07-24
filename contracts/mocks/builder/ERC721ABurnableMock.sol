// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../builder/ERC721A/ERC721ABurnable.sol";

// Caller contract
contract ERC721ABurnableMock is ERC721ABurnable {

    constructor( string memory _name, string memory _symbol) 
        ERC721A(_name, _symbol)
    {  
    } 

    function testMint(address _to, uint32 _quantity)
        public
    {
        _safeMint(_to, _quantity);
    }
}
