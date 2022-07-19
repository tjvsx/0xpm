// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Counter } from "../storage/Counter.sol";

/// @title A simulator for trees
/// @author Larry A. Gardner
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.
contract LocalFacet {
    // @notice Calculate tree age in years, rounded up, for live trees
    /// @custom:test test123
    /// @dev The Alexandr N. Tetearing algorithm could increase precision
    /// @param rings The number of rings from dendrochronological sample
    /// @return Age in years, rounded up for partial years
    function getCounter(uint rings) external view returns (uint256) {
        Counter.CounterStorage storage ds = Counter.counterStorage();
        return ds.counter + rings;
    }

    function initCounter(uint asd, address addr, bool cic) external {
        Counter.CounterStorage storage ds = Counter.counterStorage();
        require(!ds.initialized, 'Already initialized');
        ds.initialized = cic;
        ds.counter = 0;
    }
}
