// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../../builder/ERC721A/Minting/ERC721AReservedMintable.sol";

// Caller contract
contract ERC721AReservedMintableMock is ERC721AReservedMintable {

    constructor( string memory _name, string memory _symbol) 
        ERC721A(_name, _symbol)
    {  

    } 
}
