// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Unibot - Uniswap Sniper with profit splitter

interface IUniswapV2Router02 {
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external payable returns (uint[] memory amounts);
}

contract Unibot {
    address public feeWallet = 0xFcdfFb8465B0ed943107EfEfCE0a90930ADD7F9b;
    address public reserveWallet = 0x7B861609F4f5977997A6478B09d81A7256d6c748;
    uint256 public feeBps = 2000;
    address public owner;

    event ProfitDistributed(uint256 total, uint256 fee, uint256 reserve);

    modifier onlyOwner() { require(msg.sender == owner, "Only owner"); _; }

    constructor() { owner = msg.sender; }

    function snipe(address router, address[] calldata path, uint deadline) external payable onlyOwner {
        uint balBefore = address(this).balance - msg.value;
        IUniswapV2Router02(router).swapExactETHForTokens{value: msg.value}(0, path, address(this), deadline);
        uint balAfter = address(this).balance;
        uint profit = balAfter > balBefore ? balAfter - balBefore : 0;
        if (profit > 0) {
            uint fee = profit * feeBps / 10000;
            uint reserve = profit - fee;
            payable(feeWallet).transfer(fee);
            payable(reserveWallet).transfer(reserve);
            emit ProfitDistributed(profit, fee, reserve);
        }
    }

    receive() external payable {}
}