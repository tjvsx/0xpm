// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRepository } from "../interfaces/IRepository.sol";

contract HabitatRepository is IRepository {
    address owner;
    mapping(address => bool) facets;
    constructor(address _owner, address[] memory  _addresses) {
        owner = _owner;

        for (uint i = 0; i < _addresses.length; i++) {
            facets[_addresses[i]] = true;
        }
    }
    function edit(address facet, bool value) external {
        require(owner == address(msg.sender), "Only owner can write repo");
        facets[facet] = value;
    }
    function isInRepo(address facet) override view external returns (bool) {
        return facets[facet];
    }
}