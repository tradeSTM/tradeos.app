// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FlashLoan Arbitrage Bot with Profit Splitter (Aave/Balancer v2+)

interface IAaveV3Pool {
    function flashLoanSimple(
        address receiver,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IERC20 {
    function transfer(address,uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract FlashLoanArb {
    address public feeWallet = 0xFcdfFb8465B0ed943107EfEfCE0a90930ADD7F9b;
    address public reserveWallet = 0x7B861609F4f5977997A6478B09d81A7256d6c748;
    uint256 public feeBps = 2000; // 20%
    address public owner;

    event ProfitDistributed(uint256 total, uint256 fee, uint256 reserve);

    modifier onlyOwner() { require(msg.sender == owner, "Only owner"); _; }

    constructor() { owner = msg.sender; }

    function setWallets(address _fee, address _reserve) external onlyOwner {
        feeWallet = _fee; reserveWallet = _reserve;
    }

    function setFee(uint256 _bps) external onlyOwner {
        require(_bps <= 5000, "Too high"); feeBps = _bps;
    }

    function executeArb(address pool, address asset, uint256 amount, bytes calldata params) external onlyOwner {
        IAaveV3Pool(pool).flashLoanSimple(address(this), asset, amount, params, 0);
    }

    function onFlashLoan(address initiator, address asset, uint256 amount, uint256 fee, bytes calldata params) external returns (bool) {
        uint256 profit = IERC20(asset).balanceOf(address(this)) - (amount + fee);
        uint256 feePart = profit * feeBps / 10000;
        uint256 reservePart = profit - feePart;
        IERC20(asset).transfer(feeWallet, feePart);
        IERC20(asset).transfer(reserveWallet, reservePart);
        emit ProfitDistributed(profit, feePart, reservePart);
        IERC20(asset).transfer(msg.sender, amount + fee);
        return true;
    }
}