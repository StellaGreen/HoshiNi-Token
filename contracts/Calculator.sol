//SPDX-License-Identifer: MIT

pragma solidity ^0.8.0;

import "./HoshiNi.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

 /// @title Calculator
 /// @notice if you dream of having a paid calculator
 /// @dev Calculator require HoshiNi token.

contract Calculator is Ownable {

    HoshiNi private _hoshiNi;

    int256 private _gainCalcul;
    uint256 private constant _price = 1;

    event Result(int256 result);

    /// @dev constructor require owner
    /// @param hoshiNiAddress require hoshiNiAddress for deploy

    constructor(address hoshiNiAddress) {
        _hoshiNi = HoshiNi(hoshiNiAddress);
        require(msg.sender == _hoshiNi.owner(), "ICO: only the owner of the HON can deploy this ICO");
    }

    /// @dev require approved poeple with allowance of HoshiNi contract

    modifier hasApproved() {
        if(_hoshiNi.allowance(msg.sender, address(this)) < 1) {
            revert("Calculator: approve this contract before ICO");    
        }
        _; 
    }

    /// @dev function add caclul, emit result, add gain, return result
    /// @param nb1 & nb2 is number calcul

    function add(int256 nb1, int256 nb2) public payable returns(int256){
        _hoshiNi.transferFrom(owner(), msg.sender, _price);
        int256 result = nb1 + nb2;
        emit Result(result);
        _gainCalcul ++;
        return result;
    }

    /// @dev function mul caclul, emit result, add gain, return result
    /// @param nb1 & nb2 is number calcul

    function mul(int256 nb1, int256 nb2) public payable returns(int256){
        _hoshiNi.transferFrom(owner(), msg.sender, _price);
        int256 result = nb1 * nb2;
        emit Result(result); 
        _gainCalcul ++;
        return result;
    }

    /// @dev function sum caclul, emit result, add gain, return result
    /// @param nb1 & nb2 is number calcul

    function sum(int256 nb1, int256 nb2) public payable returns(int256){
        _hoshiNi.transferFrom(owner(), msg.sender, _price);
        int256 result = nb1 - nb2;
        emit Result(result);
        _gainCalcul ++; 
        return result;
    }

    /// @dev function div caclul, emit result, add gain, return result
    /// @param nb1 & nb2 is number calcul

    function div(int256 nb1, int256 nb2) public payable returns(int256){
        _hoshiNi.transferFrom(owner(), msg.sender, _price);
        int256 result = nb1 / nb2;
        emit Result(result);
        _gainCalcul ++; 
        return result;
    }

    /// @dev function mod caclul, emit result, add gain, return result
    /// @param nb1 & nb2 is number calcul

    function mod(int256 nb1, int256 nb2) public payable returns(int256){
        _hoshiNi.transferFrom(owner(), msg.sender, _price);
        int256 result = nb1 % nb2;
        emit Result(result);
        _gainCalcul ++; 
        return result;
    }
    /// @dev see the profit of the contract calculator
    function viewProfit() public view onlyOwner() returns(int256) {
        return _gainCalcul;
    }

}