// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../utils/WithdrawalSplittable.sol";

// Caller contract
contract WithdrawalSplittableMock is WithdrawalSplittable , ERC20
{
    constructor() ERC20("StandardERC20", "ERC20") {}
    
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
