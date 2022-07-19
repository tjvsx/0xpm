// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { MinimalProxyFactory } from '@solidstate/contracts/factory/MinimalProxyFactory.sol';

import { Upgrade } from './Upgrade.sol';
import { Uninstaller, IUninstaller } from './Uninstaller.sol';
import { IInstaller } from './IInstaller.sol';

contract Installer is IInstaller, Upgrade, MinimalProxyFactory {

  address immutable public model;
  constructor() {
    IDiamondWritable.FacetCut[] memory cut = new IDiamondWritable.FacetCut[](0);
    Uninstaller instance = new Uninstaller();
    model = address(instance);
    IUninstaller(model).set(cut);
  }

  bool private initialized;
  address public uninstaller;

  function set(
    IDiamondWritable.FacetCut[] memory _cuts,
    address _target,
    bytes memory _data
  ) external {
    require(!initialized, 'Upgrade: already registered.');
    //store cut
    IDiamondWritable.FacetCut memory c;
    for (uint256 i; i < _cuts.length; i++) { 
      c = _cuts[i];
      cuts.push(Cut(c.target, c.action, c.selectors));
    }
    target = _target;
    data = _data;

    //create uninstaller
    uninstaller = _deployMinimalProxy(model);
    IUninstaller(uninstaller).set(_cuts);

    initialized = true;
  }

}