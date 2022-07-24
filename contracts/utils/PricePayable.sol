// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract PricePayable
{
    error EthPaymentRequired(uint256 value);
    error Erc20InsufficientAllowance(IERC20 token, uint256 value);
    error Erc20PaymentFailed(IERC20 token, uint256 value);

    modifier ethPayable(uint256 value) {
        checkEthPayment(value);
        _;
    }

    modifier ethPayableMultiple(uint256 price, uint256 count) {
        uint256 value = price * count;
        checkEthPayment(value);
        _;
    }

    modifier erc20Payable(IERC20 token, uint256 value) {
        checkErc20Payment(token, value);
        _;
    }

    modifier erc20PayableMultiple(IERC20 token, uint256 price, uint256 count) {
        uint256 value = price * count;
        checkErc20Payment(token, value);
        _;
    }

    function checkEthPayment(uint256 value) internal {
        if (msg.value != value)
            revert EthPaymentRequired(value);
    }

    function checkErc20Payment(IERC20 token, uint256 value) internal {
        if (token.allowance(msg.sender, address(this)) < value)
            revert Erc20InsufficientAllowance(token, value);

        if (!token.transferFrom(msg.sender, address(this), value))
            revert Erc20PaymentFailed(token, value);
    }
}
