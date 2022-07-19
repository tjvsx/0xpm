// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Diamond } from '../Diamond.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

contract DiamondFactory {
  event Registered(address diamond, address owner);

  // // test if minimalProxyFactory works (possible issue w double-delegatecall)
  // address immutable public model;
  // constructor(
  //   IDiamondWritable.FacetCut[] memory cuts,
  //   address target,
  //   bytes memory data
  // ) {
  //   Diamond diamond = new Diamond(cuts, target, data);
  //   model = address(diamond);
  // }

  //also check out Factory.sol solidstate impl?

  function createDiamond(
    IDiamondWritable.FacetCut[] calldata cuts,
    address target,
    bytes calldata data
  ) external returns (address) {
    Diamond diamond = new Diamond(msg.sender, cuts, target, data);
    emit Registered(address(diamond), msg.sender);
    return address(diamond);
  }
}