// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./HoshiNi.sol";

 /// @title ICO of HoshiNi
 /// @notice This is an ICO for a HoshiNi token, This ICO will only last 2 weeks.
 /// @dev HoshiNI is an ERC20.

contract IcoHoshiNi is Ownable {

    using Address for address payable;

    HoshiNi private _hoshiNi;

    uint256 private _rate;
    uint256 private _supply;
    uint256 private _gain;
    uint256 private _endTime;
    bool private _started;

    event Sold(address indexed sender, uint256 amount);
    event Withdrew(address indexed sender, uint256 amount);

     /// @dev implementation of the modifier time tester for the ICO

    modifier icoIsRunning() {
        if (_endTime == 0) {
            revert("ICO: time is past, you can not buy HON");
        }
        require(block.timestamp < _endTime, "ICO: time not paste, waiting the end of ICO");
        _;
    }

    /// @dev verification of the approval if allowance

    modifier hasApproved() {
        if(_hoshiNi.allowance(msg.sender, address(this)) < 1) {
            revert("Calculator: approve this contract before ICO");    
        }
        _; 
    }

    /// @dev Set the HoshiNi contract address and definition of the value in ETH for a token
    /// @param hoshiNiAddress Set the address of the ERC20 RoToken.

    constructor(address hoshiNiAddress) {
        _hoshiNi = HoshiNi(hoshiNiAddress);
        require(msg.sender == _hoshiNi.owner(), "ICO: only the owner of the HON can deploy this ICO");
        _rate = 1e9;
    }

    /// @dev function to start the ICO, require testing allowance, start of timer, and started function 
    /// @param supply_ you have to define the supply

    function startIco(uint256 supply_) public onlyOwner() hasApproved(){
        require(_hoshiNi.allowance(msg.sender, address(this)) >= supply_, "ICO: you do not have enought with allowance");
        _endTime = block.timestamp + 2 weeks;
        _supply = supply_;
        _started = true;
    }

    /// @dev fund recovery function for external transactions, price calculation, use of the transfer From Oppenzeplin, 
    /// @dev gain added to the basket, and past sale emit

    receive() external payable icoIsRunning() {
        uint256 amountToken = msg.value * _rate;
        if (supplyICO() < amountToken) {
            revert("HoshiNi: there is not enought HON remaining for your demand");
        }
        _hoshiNi.transferFrom(owner(), msg.sender, amountToken);
        _gain += msg.value;
        emit Sold(msg.sender, amountToken);
    }

    /// @dev function buyTokens if ICO is running, price calulation, use of te transerFrom from Oppenzeplin
    /// @dev gain added to the basket, and past sale emit

    function buyTokens() public payable icoIsRunning() {
        uint256 amount = msg.value * _rate;
        if (supplyICO() < amount) {
            revert("HoshiNi: there is not enought HON remaining for your demand");
        }
        _hoshiNi.transferFrom(owner(), msg.sender, amount);
        _gain += msg.value;
        emit Sold(msg.sender, amount);
    }

    /// @dev function withdraw for the owner after the end of the ICO time,
    /// @dev add amount of token for the owner and emit en event withdrew

    function withdrawAll() public onlyOwner() {
        require(block.timestamp > _endTime, "ICO: not finished, wait the end of time");
        require(address(this).balance > 0, "ICO: cannot withdraw 0 ether");
        uint256 amount = address(this).balance;
        payable(msg.sender).sendValue(amount);
        emit Withdrew(address(this), amount);
    }

    /// @dev function for view the quantities of the total HoshiNi tokens

    function totalSupply() public view returns (uint256) {
        return _hoshiNi.totalSupply();
    }

    /// @dev return the rate ( price for 1 token Hoshini in ethereum token )

    function tokenPrice() public view returns (uint256) {
        return _rate;
    }

    /// @dev testing allownace address for this contract if his running

    function supplyICO() public view icoIsRunning() returns (uint256) {
        return _hoshiNi.allowance(owner(), address(this));
    }

    /// @dev return how many of token as sold

    function tokenSold() public view onlyOwner() returns (uint256) {
        return _supply - _hoshiNi.allowance(owner(), address(this));
    }

    /// @dev return the amount of token sold

    function getGain() public view onlyOwner() returns (uint256) {
        return _gain;
    }

    /// @dev return the balance of HoshiNi token for this account 

    function balanceOf(address account) public view returns (uint256) {
        return  _hoshiNi.balanceOf(account);
    }

    /// @dev return the rate for calcul the price of HoshiNi

    function rate() public view returns (uint256) {
        return _rate;
    }

    /// @dev return the rest of time

    function secondeRemaining() public view returns (uint256) {
        return _endTime - block.timestamp; 
    }

}