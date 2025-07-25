// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TradeOSAccess is Ownable {
    mapping(address => bool) public admins;

    event AdminAdded(address indexed user);
    event AdminRevoked(address indexed user);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an admin");
        _;
    }

    function addAdmin(address user) external onlyOwner {
        admins[user] = true;
        emit AdminAdded(user);
    }