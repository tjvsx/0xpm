// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRepository {
    function isInRepo(address facet) view external returns (bool);
}
