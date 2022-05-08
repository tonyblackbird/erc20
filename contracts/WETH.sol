// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Wrapped Ethereum", "WETH") {

    }

    function Deposit() public payable {
        _mint(msg.sender, msg.value);
    }

    function Widthdraw(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Not enough WETH to widthdraw");

        _burn(msg.sender, amount);
        payable(msg.sender).call{value: amount};
    }
}
