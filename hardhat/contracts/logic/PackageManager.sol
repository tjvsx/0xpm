// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Library } from './libraries/Library.sol';
import { IPackageManager } from './IPackageManager.sol';
import { IGit } from './IGit.sol';
import { Installer } from '../external/Installer.sol';
import { OwnableInternal } from '@solidstate/contracts/access/ownable/OwnableInternal.sol';

import 'hardhat/console.sol';

contract PackageManager is IPackageManager, OwnableInternal {

  address public immutable xpm;

  constructor(address diamond) {
    xpm = diamond;
  }

  function install(address account, string memory repo) external onlyOwner {
    require(!IGit(xpm).isSubscriber(account, repo, address(this)), '0xpm: Already installed!');
    address pkg = IGit(xpm).latest(account, repo);
    Library._upgrade(pkg);
    IGit(xpm).subscribe(account, repo, address(this));
    emit Upgraded(account, repo, pkg, address(0), address(this));
  }

  function uninstall(address account, string memory repo, address pkg) external onlyOwner {
    address uninstaller = Installer(pkg).uninstaller();
    Library._upgrade(uninstaller);
    IGit(xpm).unsubscribe(account, repo, address(this));
    emit Upgraded(account, repo, address(0), pkg, address(this));
  }

  function update(address account, string memory repo, address toPkg, address fromPkg) external onlyOwner {
    require(IGit(xpm).isSubscriber(account, repo, address(this)), '0xpm: Not installed!');
    address latestPkg = IGit(xpm).latest(account, repo);
    require(latestPkg == toPkg, "PackageManager: new pkg does not match latest.");
    Library._update(toPkg, fromPkg);
    emit Upgraded(account, repo, toPkg, fromPkg, address(this));
  }
}
