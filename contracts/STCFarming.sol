// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { ShitCoin } from "./ShitCoin.sol";

contract STCFarming {
    IERC20 immutable lpToken = IERC20(0x8BAe696C6D18BC0532C49856fFC313e1e60DE97a);
    ShitCoin immutable shitCoin = ShitCoin(0x8DbD9197e9e7eD7d9DB44a2976C2254173bB0cd3);

    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Deposit) private _deposits;

    event Stake(address sender, uint256 amount, uint256 timestamp);

    function stake(uint256 amount) public {
        if(_deposits[msg.sender].amount > 0) {
            // delegate call?
            claim();
        }

        // Why it does not work with approve in function?
        //lpToken.approve(address(this), amount);
        lpToken.transferFrom(msg.sender, address(this), amount);

        _deposits[msg.sender].amount = amount;
        _deposits[msg.sender].timestamp = block.timestamp;

        emit Stake(msg.sender, amount, block.timestamp);
    }

    function claim() public {
        require(_deposits[msg.sender].timestamp != 0, "You have not deposited yet");

        uint256 reward = calculateRewards(msg.sender);
        shitCoin.mint(msg.sender, reward);

        _deposits[msg.sender].timestamp = 0;
    }

    // should be reentrant
    function withdraw(uint256 amount) public {
        // delegate call?
        claim();

        require(amount <= _deposits[msg.sender].amount, "Insufficient deposit");
        _deposits[msg.sender].amount -= amount;

        lpToken.transfer(msg.sender, amount);
    }

    function getUserInfo(address user) public view returns(uint256, uint256, uint256) {
        return(_deposits[msg.sender].amount, _deposits[msg.sender].timestamp, calculateRewards(user));
    }

    function calculateRewards(address user) public view returns(uint256) {
        uint256 timeDifference = block.timestamp - _deposits[user].timestamp;

        // todo: check calculations on floating point 
        return((timeDifference / 52 weeks) * 120 / 100);
    }
}