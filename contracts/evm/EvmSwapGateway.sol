// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract EvmSwapGateway {
    address public owner;
    uint256 public nextDepositId;

    struct Deposit {
        address user;
        address token; // Address(0) for Native ETH
        uint256 amount;
        string targetChain;
        string targetAddress;
        bool processed;
    }

    mapping(uint256 => Deposit) public deposits;

    event Deposited(
        uint256 indexed depositId,
        address indexed user,
        address indexed token,
        uint256 amount,
        string targetChain,
        string targetAddress
    );

    event MarkedProcessed(uint256 indexed depositId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit(
        address token,
        uint256 amount,
        string calldata targetChain,
        string calldata targetAddress
    ) external payable returns (uint256 depositId) {
        if (token == address(0)) {
            require(msg.value > 0, "native amount=0");
            amount = msg.value;
        } else {
            require(amount > 0, "token amount=0");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "transfer failed");
        }

        depositId = nextDepositId++;
        deposits[depositId] = Deposit({
            user: msg.sender,
            token: token,
            amount: amount,
            targetChain: targetChain,
            targetAddress: targetAddress,
            processed: false
        });

        emit Deposited(
            depositId,
            msg.sender,
            token,
            amount,
            targetChain,
            targetAddress
        );
    }

    function markProcessed(uint256 depositId) external onlyOwner {
        Deposit storage d = deposits[depositId];
        require(d.user != address(0), "not found");
        require(!d.processed, "already processed");
        d.processed = true;
        emit MarkedProcessed(depositId);
    }

    // Function to withdraw stuck tokens/native (for the solver to actually payout on the other side in a real scenario)
    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
    }
}
