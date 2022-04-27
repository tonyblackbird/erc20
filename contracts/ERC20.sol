//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

/** 
    @dev An ERC20 token
*/

contract ERC20 {
    string public nameOfToken;
    string public tickerOfToken;

    uint8 public decimalsOfToken;
    uint256 public totalSupplyOfToken;

    address public immutable owner;

    // account => balance
    mapping(address => uint256) public balances;

    // account => (spender => balanceCanWidthdraw)
    mapping(address => mapping(address => uint256)) public allowances;
    
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Mint(address indexed _owner, uint256 _value);
    event Burn(address indexed _owner, uint256 _value);


    constructor(string memory _name, string memory _ticker, uint8 _decimals) {
        nameOfToken = _name;
        tickerOfToken = _ticker;
        decimalsOfToken = _decimals;

        owner = msg.sender;
    }

    modifier onlyOwner {
        _onlyOwner();
        _;
    }

    function _onlyOwner() private view {
        require(msg.sender == owner, "You're not an owner");
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value, "Insufficient balance");

        balances[msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balances[_from] >= _value, "Insufficient balance");

        uint256 _allowance = allowance(_from, msg.sender);
        require(_value <= _allowance, "Insufficient allowance");

        allowances[_from][msg.sender] -= _value;

        balances[_from] -= _value;
        balances[_to] += _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    // TODO: safeApprove function
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowances[msg.sender][_spender] = _value;

        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }


    function mint(address _address, uint256 amount) external onlyOwner returns (bool success) {
        totalSupplyOfToken += amount;
        balances[_address] += amount;

        emit Mint(_address, amount);

        return true;
    }

    function burn(address _from, uint256 amount) external onlyOwner returns (bool success) {
        require(balances[_from] > amount, "Insufficient balance");

        balances[_from] -= amount;
        totalSupplyOfToken -= amount;

        emit Burn(_from, amount);

        return true;
    }
}
