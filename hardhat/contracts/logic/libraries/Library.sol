// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { DiamondBaseStorage } from '@solidstate/contracts/proxy/diamond/base/DiamondBaseStorage.sol';
import { GovernanceStorage } from '../../_library/0xpm/governance/storage/GovernanceStorage.sol';
import { IUpgrade, Upgrade } from '../../external/Upgrade.sol';
import { GitStorage } from '../../storage/GitStorage.sol';
import { Installer } from '../../external/Installer.sol';

library Library {
  using DiamondBaseStorage for DiamondBaseStorage.Layout;
  using GovernanceStorage for GovernanceStorage.Layout;
  using GitStorage for GitStorage.Layout;

  function _execute(uint256 _proposalId) internal returns (bool) {
    address upgrade = GovernanceStorage.layout().proposals[_proposalId].proposalContract;
    _upgrade(upgrade);
    return true;
  }

  function _upgrade(address upgrade) internal {
    ( IDiamondWritable.FacetCut[] memory _cuts, address _target, bytes memory _data
    ) = IUpgrade(upgrade).get();
    _cut(_cuts, _target, _data);
  }

  function _update(address newPkg, address oldPkg) internal {
    address uninstaller = Installer(oldPkg).uninstaller();
    ( IDiamondWritable.FacetCut[] memory cuts_, address target_, bytes memory data_
    ) = IUpgrade(uninstaller).get();
    _cut(cuts_, target_, data_);

    ( IDiamondWritable.FacetCut[] memory _cuts, address _target, bytes memory _data
    ) = IUpgrade(newPkg).get();
    _cut(_cuts, address(0), '');
  }

  function _cut(
    IDiamondWritable.FacetCut[] memory _cuts, 
    address _target, 
    bytes memory _data
  ) internal {
    DiamondBaseStorage.layout().diamondCut(_cuts, _target, _data);
  }

}