// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { DiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/DiamondWritable.sol';

contract Writable is DiamondWritable {
  receive() external payable {}
}