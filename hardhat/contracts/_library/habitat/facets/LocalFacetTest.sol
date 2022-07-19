// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Counter } from "../storage/Counter.sol";

contract LocalFacetTest {
    struct Qwe {
        uint test;
    }
    struct Asd {
        Qwe test;
    }
    function setCounter(uint256 amount) public {
        Counter.CounterStorage storage ds = Counter.counterStorage();
        ds.counter += amount;
    }

    function increaseVotingPower(address _address, uint _power) public {
        Counter.CounterStorage storage ds = Counter.counterStorage();
        ds.votingPower[_address] += _power;
    }

    function test(Asd calldata prova) public {
        Counter.CounterStorage storage ds = Counter.counterStorage();
        ds.counter += prova.test.test;
    }
}
