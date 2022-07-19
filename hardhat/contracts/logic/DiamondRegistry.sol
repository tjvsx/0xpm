// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Diamond } from '../Diamond.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { DiamondBaseStorage } from '@solidstate/contracts/proxy/diamond/base/DiamondBaseStorage.sol';
import { IERC173 } from '@solidstate/contracts/access/IERC173.sol';

contract DiamondRegistry {
  using DiamondBaseStorage for DiamondBaseStorage.Layout;

  event Registered(address diamond, address owner);
  event Unregistered(address diamond);

  address pm;
  bytes4[] pmSelectors;

  address target;
  bytes data;

  constructor(address packagemanager, bytes4[] memory _pmSelectors, address _initAddr, bytes memory _initFunc) {
    pm = packagemanager;
    pmSelectors = _pmSelectors;
    target = _initAddr;
    data = _initFunc;
  }

  function register() external {
    // require msg.sender === diamond.owner
    // cut in PackageManager.sol
    IDiamondWritable.FacetCut[] memory facetCuts = new IDiamondWritable.FacetCut[](1);
    facetCuts[0] = IDiamondWritable.FacetCut({
        target: address(pm),
        action: IDiamondWritable.FacetCutAction.ADD,
        selectors: pmSelectors
    });
    DiamondBaseStorage.layout().diamondCut(facetCuts, target, data);
    emit Registered(address(this), msg.sender);
  }

  function unregister() external {
    // require msg.sender === diamond.owner
    // remove PackageManager.sol
    IDiamondWritable.FacetCut[] memory facetCuts = new IDiamondWritable.FacetCut[](1);
    facetCuts[0] = IDiamondWritable.FacetCut({
        target: address(0),
        action: IDiamondWritable.FacetCutAction.REMOVE,
        selectors: pmSelectors
    });
    DiamondBaseStorage.layout().diamondCut(facetCuts, address(0), '0x');
    emit Unregistered(address(this));
  }
}