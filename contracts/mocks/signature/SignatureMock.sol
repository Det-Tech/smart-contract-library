// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../signature/Signature.sol";

// Caller contract
contract SignatureMock is Signature {
    event MintToken(bool _mint);

    constructor() Signature(msg.sender) {}

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
        emit MintToken(true);
    }

    function setSignerAddress (address _setSignerAddress) public{
        super._setSignerAddress(_setSignerAddress);
    }

}
