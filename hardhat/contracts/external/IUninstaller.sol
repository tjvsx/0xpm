// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
interface IUninstaller {

  function set(IDiamondWritable.FacetCut[] memory _cuts) external;
  
}
