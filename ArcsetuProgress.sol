// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title GiwaSetu Progress Tracker
/// @notice Records a user's Web3 onboarding milestones on-chain:
///         wallet creation, practice transactions, and course completion.
contract GiwaSetuProgress {
    struct UserProgress {
        bool hasWallet;
        bool completedOnboarding;
        uint256 practiceTxCount;
    }

    mapping(address => UserProgress) public progress;

    event WalletCreated(address indexed user);
    event PracticeTransaction(address indexed user, uint256 txNumber);
    event OnboardingCompleted(address indexed user);

    /// @notice Step 1: mark that the user has created their wallet
    function markWalletCreated() external {
        progress[msg.sender].hasWallet = true;
        emit WalletCreated(msg.sender);
    }

    /// @notice Step 2: record a practice transaction on testnet
    function recordPracticeTransaction() external {
        require(progress[msg.sender].hasWallet, "Create your wallet first");
        progress[msg.sender].practiceTxCount += 1;
        emit PracticeTransaction(msg.sender, progress[msg.sender].practiceTxCount);
    }

    /// @notice Step 3: mark onboarding complete after at least one practice tx
    function completeOnboarding() external {
        require(progress[msg.sender].practiceTxCount >= 1, "Complete a practice transaction first");
        progress[msg.sender].completedOnboarding = true;
        emit OnboardingCompleted(msg.sender);
    }

    /// @notice Read back the caller's own onboarding progress
    function getMyProgress() external view returns (bool hasWallet, bool completedOnboarding, uint256 practiceTxCount) {
        UserProgress memory p = progress[msg.sender];
        return (p.hasWallet, p.completedOnboarding, p.practiceTxCount);
    }
}
