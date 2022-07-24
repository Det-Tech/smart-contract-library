// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract ERC721ABaseURI is ERC721A, Ownable 
{
    using Strings for uint256;

    string private baseURI;

    error NoTrailingSlash();
    
    function setBaseURI(string memory _baseURI) public onlyOwner {
        if (bytes(_baseURI)[bytes(_baseURI).length - 1] != bytes1("/"))
            revert NoTrailingSlash();
        baseURI = _baseURI;
    }

    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(baseURI, "contract.json"));
    }
    
    function tokenURI(uint256 tokenId)
        public view virtual override
        returns (string memory)
    {
        require(_exists(tokenId), "URI query for nonexistent token");

        return
            string(
                abi.encodePacked(
                    baseURI,
                    "token/",
                    tokenId.toString(),
                    ".json"
                )
            );
    }
}
