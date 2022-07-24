// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../utils/PackTokenIds.sol";

contract PackTokenIdsMock is PackTokenIds {

    function isFreeMintTokenUsed(uint256 token_id) external view returns (bool) {
        (bool freeMintUsed, bool preSaleUsed) = usedTokenId(token_id);

        return freeMintUsed;
    }

    function isPreSaleTokenUsed(uint256 token_id) external view returns (bool) {
        (bool freeMintUsed, bool preSaleUsed) = usedTokenId(token_id);

        return preSaleUsed;
    }

    function isUnpackBool(uint256 _packedBools, uint256 _boolIndex)
        external pure
        returns (bool)
    {
        return unPackBool(_packedBools, _boolIndex);
    }
}
