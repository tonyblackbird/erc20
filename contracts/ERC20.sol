//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

/** 
    @dev An ERC20 token
    TODO: Add safemath
*/

contract ERC20 {
    string nameOfToken;
    string tickerOfToken;

    uint8 decimalsOfToken;
    uint256 totalSupplyOfToken;

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


    function name() public view returns (string memory) {
        return nameOfToken;
    }

    function symbol() public view returns (string memory) {
        return tickerOfToken;
    }

    function decimals() public view returns (uint8) {
        return decimalsOfToken;
    }

    function totalSupply() public view returns (uint256) {
        return totalSupplyOfToken;
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

        uint256 _allowance = allowance(_from, _to);
        require(_value <= _allowance, "Insufficient allowance");

        allowances[_from][_to] -= _value;

        balances[_from] -= _value;
        balances[_to] += _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        // TODO: require _value to be less then balance ???
        allowances[msg.sender][_spender] = _value;

        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }


    function mint(uint256 amount, address _address) external onlyOwner returns (bool success) {
        totalSupplyOfToken += amount;
        balances[_address] += amount;

        emit Mint(msg.sender, amount);

        return true;
    }

    function burn(uint256 amount) external onlyOwner returns (bool success) {
        totalSupplyOfToken -= amount;
        balances[msg.sender] -= amount;

        emit Burn(msg.sender, amount);

        return true;
    }
}
