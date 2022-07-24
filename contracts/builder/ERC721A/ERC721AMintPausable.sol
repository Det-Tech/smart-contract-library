// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";

import "erc721a/contracts/ERC721A.sol";
import "../../sale/SaleState.sol";

abstract contract ERC721AMintPausable is ERC721A, Ownable, SaleState
{
    function unpauseMint() public virtual onlyOwner {
        _unpause();
    }

    function pauseMint() public virtual onlyOwner {
        _pause();
    }
    function setSaleState(State state)  public virtual onlyOwner {
        _setSaleState(state);
    }
}
