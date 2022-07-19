// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { MinimalProxyFactory } from '@solidstate/contracts/factory/MinimalProxyFactory.sol';

import { IGit } from './IGit.sol';
import { GitStorage } from '../storage/GitStorage.sol';
import { Installer, IInstaller } from '../external/Installer.sol';
import { Uninstaller, IUninstaller } from '../external/Uninstaller.sol';

contract Git is IGit, MinimalProxyFactory {
  using GitStorage for GitStorage.Layout;

  address immutable public model;

  constructor (IDiamondWritable.FacetCut[] memory _cuts) {
    Installer _instance = new Installer();
    model = address(_instance);
    IInstaller(model).set(_cuts, address(0), '');
  }  
  
  /**
   * @inheritdoc IGit
   */
  function commit(
    string calldata name,
    IDiamondWritable.FacetCut[] calldata cuts,
    address target,
    bytes calldata data
  ) external returns (address) {
    require(bytes(name).length > 0 && cuts.length > 0, 'Git: input required fields');
    GitStorage.Layout storage l = GitStorage.layout();
    address instance = _deployMinimalProxy(model);
    IInstaller(instance).set(cuts, target, data);
    l.commit(msg.sender, name, instance);
    return instance;
  }

  /**
   * @inheritdoc IGit
   */
  function latest(
    address owner, 
    string memory name
  ) external view returns (address) {
    return GitStorage.layout().latest(owner, name);
  }

  function unsubscribe(address account, string memory repo, address user) external {
    GitStorage.layout().unsubscribe(account, repo, user);
  }

  function subscribe(address account, string memory repo, address user) external {
    GitStorage.layout().subscribe(account, repo, user);
  }

  function isSubscriber(address account, string memory repo, address user) external view returns (bool) {
    return GitStorage.layout().isSubscriber(account, repo, user);
  }
}