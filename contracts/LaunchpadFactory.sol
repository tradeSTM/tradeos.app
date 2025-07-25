// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LaunchpadFactory is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct LaunchpadInfo {
        address tokenAddress;
        uint256 hardCap;
        uint256 softCap;
        uint256 presaleRate;
        uint256 listingRate;
        uint256 startTime;
        uint256 endTime;
        uint256 minContribution;
        uint256 maxContribution;
        bool isWhitelisted;
        bool isAuditRequired;
        LaunchpadStatus status;
    }

    enum LaunchpadStatus {
        Pending,
        Active,
        Cancelled,
        Completed,
        Failed
    }

    mapping(address => LaunchpadInfo) public launchpads;
    mapping(address => mapping(address => uint256)) public contributions;
    mapping(address => address[]) public whitelists;

    event LaunchpadCreated(
        address indexed tokenAddress,
        address indexed owner,
        uint256 hardCap,
        uint256 startTime
    );
    event ContributionMade(
        address indexed launchpad,
        address indexed contributor,
        uint256 amount
    );
    event LaunchpadCompleted(
        address indexed launchpad,
        uint256 totalRaised
    );

    function createLaunchpad(
        address _tokenAddress,
        uint256 _hardCap,
        uint256 _softCap,
        uint256 _presaleRate,
        uint256 _listingRate,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minContribution,
        uint256 _maxContribution,
        bool _isWhitelisted,
        bool _isAuditRequired
    ) external nonReentrant {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_hardCap > _softCap, "Hard cap must be greater than soft cap");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");

        LaunchpadInfo storage launchpad = launchpads[_tokenAddress];
        launchpad.tokenAddress = _tokenAddress;
        launchpad.hardCap = _hardCap;
        launchpad.softCap = _softCap;
        launchpad.presaleRate = _presaleRate;
        launchpad.listingRate = _listingRate;
        launchpad.startTime = _startTime;
        launchpad.endTime = _endTime;
        launchpad.minContribution = _minContribution;
        launchpad.maxContribution = _maxContribution;
        launchpad.isWhitelisted = _isWhitelisted;
        launchpad.isAuditRequired = _isAuditRequired;
        launchpad.status = LaunchpadStatus.Pending;

        emit LaunchpadCreated(_tokenAddress, msg.sender, _hardCap, _startTime);
    }

    function contribute(address _launchpadAddress) external payable nonReentrant {
        LaunchpadInfo storage launchpad = launchpads[_launchpadAddress];
        require(launchpad.status == LaunchpadStatus.Active, "Launchpad not active");
        require(block.timestamp >= launchpad.startTime, "Not started");
        require(block.timestamp <= launchpad.endTime, "Ended");
        require(msg.value >= launchpad.minContribution, "Below min contribution");
        require(msg.value <= launchpad.maxContribution, "Above max contribution");

        if (launchpad.isWhitelisted) {
            require(isWhitelisted(_launchpadAddress, msg.sender), "Not whitelisted");
        }

        contributions[_launchpadAddress][msg.sender] += msg.value;
        emit ContributionMade(_launchpadAddress, msg.sender, msg.value);
    }

    function finalizeLaunchpad(address _launchpadAddress) external nonReentrant {
        LaunchpadInfo storage launchpad = launchpads[_launchpadAddress];
        require(msg.sender == owner(), "Only owner");
        require(launchpad.status == LaunchpadStatus.Active, "Not active");
        require(block.timestamp > launchpad.endTime, "Not ended");

        uint256 totalRaised = address(this).balance;
        if (totalRaised >= launchpad.softCap) {
            launchpad.status = LaunchpadStatus.Completed;
            // Transfer tokens to contributors
            // Add liquidity to DEX
        } else {
            launchpad.status = LaunchpadStatus.Failed;
            // Refund contributors
        }

        emit LaunchpadCompleted(_launchpadAddress, totalRaised);
    }

    function isWhitelisted(address _launchpadAddress, address _user) public view returns (bool) {
        address[] memory whitelist = whitelists[_launchpadAddress];
        for (uint i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == _user) return true;
        }
        return false;
    }

    function addToWhitelist(address _launchpadAddress, address[] calldata _users) external {
        require(msg.sender == owner(), "Only owner");
        for (uint i = 0; i < _users.length; i++) {
            whitelists[_launchpadAddress].push(_users[i]);
        }
    }
}
