// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../../builder/ERC721A/Minting/ERC721AHoldersMintable.sol";

// Caller contract
contract ERC721AHoldersMintableMock is ERC721AHoldersMintable {

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
