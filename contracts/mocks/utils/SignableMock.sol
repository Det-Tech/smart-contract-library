// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../../utils/Signable.sol";

// Caller contract
contract SignableMock is Signable {

    constructor() Signable(msg.sender) 
    {
    }

     function testSignedMint(
        uint256[] calldata freeMintTokens_,
        uint256[] calldata preSaleTokens_,
        string memory nonce_,
        bytes calldata signature_
    )
        public
        payable
        onlySignedTx(
            keccak256(abi.encodePacked(msg.sender, nonce_, freeMintTokens_, preSaleTokens_)),
            signature_
        )
    {
    }
 
}
