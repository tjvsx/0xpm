// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
interface IUpgrade {

  function get() external view returns (
    IDiamondWritable.FacetCut[] memory, 
    address, 
    bytes memory
  );
  
}
