// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

import { IUninstaller } from './IUninstaller.sol';
import { Upgrade } from './Upgrade.sol';
import { GitStorage } from '../storage/GitStorage.sol';

contract Uninstaller is IUninstaller, Upgrade {

    bool private initialized;

    function set(IDiamondWritable.FacetCut[] memory _cuts) external {
      require(!initialized, "PackageRemove: already initialized.");

      IDiamondWritable.FacetCut memory c;
      for (uint256 i; i < _cuts.length; i++) {
        c = _cuts[i];
        cuts.push(
          Cut(
            address(0),
            IDiamondWritable.FacetCutAction.REMOVE,
            c.selectors
          )
        );
      }

      initialized = true;
    }
}