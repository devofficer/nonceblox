pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Lottery is Ownable, VRFConsumerBase {

    uint256 public endTime;
    bool public lotteryStarted;
    address[] public users;
    uint256 public randomResult;

    constructor() 
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9,
            0xa36085F69e2889c224210F603D836748e7dC0088
        ) {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18;
    }

    // internal functions to generate random number

    function getRandomNumber() private returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }
    
    // User functions

    function join() external payable {
        require(lotteryStarted, "Lottery is not started yet");
        require(block.timestamp < endTime, "Lottery is already ended");
        require(msg.value == 1e17 wei, "Invalid bet amount");
        users.push(msg.sender);
    }

    // Owner functions

    function startLottery() external onlyOwner {
        require(!lotteryStarted, "Lottery is already started");
        lotteryStarted = true;
        endTime = block.timestamp + 1 hours;
    }

    function pickWinner() external onlyOwner {
        require(block.timestamp > endTime, "Lottery is still ongoing");
        bytes32 requestId = getRandomNumber();
        address payable winner = users[(randomResult % users.length) + 1];
        winner.send(users.length * 1e17);
    }
}
