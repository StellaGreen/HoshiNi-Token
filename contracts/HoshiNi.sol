//SPDX-License-Identifer: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
    *@title Initial Coin HoshiNi contract
 */
contract HoshiNi is ERC20, Ownable {
    constructor(address owner_, uint256 initialSupply) ERC20("HoshiNi", "HON") {
        _mint(owner_, initialSupply);
    }
}