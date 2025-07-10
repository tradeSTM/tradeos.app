// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AirdropChecker (auto-claim)

interface IAirdrop {
    function claim() external;
}

contract AirdropChecker {
    address public owner;
    event Claimed(address airdrop, address user);

    modifier onlyOwner() { require(msg.sender == owner, "Only owner"); _; }

    constructor() { owner = msg.sender; }

    function claimAirdrop(address airdrop) external onlyOwner {
        IAirdrop(airdrop).claim();
        emit Claimed(airdrop, msg.sender);
    }
}