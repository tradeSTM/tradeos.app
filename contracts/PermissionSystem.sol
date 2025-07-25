// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PermissionSystem is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    mapping(address => uint256) public userTiers;
    mapping(bytes32 => mapping(uint256 => bool)) public roleRequiresTier;

    event RoleGranted(bytes32 indexed role, address indexed account, uint256 tier);
    event TierUpdated(address indexed account, uint256 oldTier, uint256 newTier);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        
        // Set up tier requirements
        roleRequiresTier[OPERATOR_ROLE][2] = true;
        roleRequiresTier[BOT_ROLE][3] = true;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "Caller is not an operator");
        _;
    }

    function grantRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(getRoleAdmin(role)) 
    {
        uint256 requiredTier = getRequiredTierForRole(role);
        require(
            userTiers[account] >= requiredTier,
            "Account does not meet tier requirements"
        );
        _grantRole(role, account);
        emit RoleGranted(role, account, userTiers[account]);
    }

    function setUserTier(address account, uint256 tier) 
        external 
        onlyAdmin 
    {
        require(tier <= 4, "Invalid tier level");
        uint256 oldTier = userTiers[account];
        userTiers[account] = tier;
        emit TierUpdated(account, oldTier, tier);
    }

    function getRequiredTierForRole(bytes32 role) 
        public 
        view 
        returns (uint256) 
    {
        for (uint256 i = 0; i <= 4; i++) {
            if (roleRequiresTier[role][i]) return i;
        }
        return 0;
    }

    function setRoleTierRequirement(
        bytes32 role,
        uint256 tier,
        bool required
    ) external onlyAdmin {
        require(tier <= 4, "Invalid tier level");
        roleRequiresTier[role][tier] = required;
    }

    function hasPermission(
        address account,
        bytes32 role,
        uint256 requiredTier
    ) public view returns (bool) {
        return hasRole(role, account) && userTiers[account] >= requiredTier;
    }

    function getUserPermissions(address account) 
        external 
        view 
        returns (
            bool isAdmin,
            bool isOperator,
            bool isBot,
            bool isUser,
            uint256 tier
        ) 
    {
        return (
            hasRole(ADMIN_ROLE, account),
            hasRole(OPERATOR_ROLE, account),
            hasRole(BOT_ROLE, account),
            hasRole(USER_ROLE, account),
            userTiers[account]
        );
    }

    // Emergency functions
    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    // Override transfer control
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers paused");
    }
}
