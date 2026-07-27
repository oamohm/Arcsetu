// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcSettlementAdapter
 * @dev Extension contract for GiwaSetu handling Arc Network USDC settlement & cross-chain routing.
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcSettlementAdapter {
    address public owner;
    address public usdcTokenAddress;

    // Mapping handles (@Bhupendrxsingh) to target wallet addresses
    mapping(string => address) private handleToAddress;
    
    event SettlementExecuted(
        address indexed sender,
        address indexed recipient,
        string handle,
        uint256 amount,
        uint256 chainId
    );

    event HandleRegistered(string handle, address indexed wallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _usdcTokenAddress) {
        owner = msg.sender;
        usdcTokenAddress = _usdcTokenAddress;
    }

    // Register web3 identity handle on Arc Network layer
    function registerHandle(string calldata _handle, address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        handleToAddress[_handle] = _wallet;
        emit HandleRegistered(_handle, _wallet);
    }

    // Resolve handle to address
    function resolveHandle(string calldata _handle) public view returns (address) {
        return handleToAddress[_handle];
    }

    // Execute USDC settlement via direct address or Web3 UPI handle
    function settleUSDC(address _to, uint256 _amount, string calldata _handle) external returns (bool) {
        require(_amount > 0, "Amount must be greater than zero");
        
        address target = _to;
        if (target == address(0) && bytes(_handle).length > 0) {
            target = resolveHandle(_handle);
        }
        
        require(target != address(0), "Recipient address not found");

        IERC20 usdc = IERC20(usdcTokenAddress);
        bool success = usdc.transferFrom(msg.sender, target, _amount);
        require(success, "USDC transfer failed");

        emit SettlementExecuted(msg.sender, target, _handle, _amount, block.chainid);
        return true;
    }

    // Update USDC Contract address if required
    function setUSDCTokenAddress(address _newAddress) external onlyOwner {
        usdcTokenAddress = _newAddress;
    }
}
