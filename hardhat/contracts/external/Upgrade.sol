// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

import { IUpgrade } from './IUpgrade.sol';

contract Upgrade is IUpgrade {

  bool private registered;

  struct Cut {
    address target;
    IDiamondWritable.FacetCutAction action;
    bytes4[] selectors;
  }

  Cut[] public cuts;
  address public target;
  bytes public data;

  function get() external view returns (
    IDiamondWritable.FacetCut[] memory, 
    address, 
    bytes memory
  ) {
    IDiamondWritable.FacetCut[] memory _cuts = new IDiamondWritable.FacetCut[](cuts.length);
    for (uint i; i < _cuts.length; i++) {
      _cuts[i] = IDiamondWritable.FacetCut({
        target: cuts[i].target,
        action: cuts[i].action,
        selectors: cuts[i].selectors
      });
    }
    return(_cuts, target, data);
  }
}