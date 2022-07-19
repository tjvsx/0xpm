// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { DiamondBase, DiamondBaseStorage } from '@solidstate/contracts/proxy/diamond/base/DiamondBase.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { OwnableInternal, OwnableStorage } from '@solidstate/contracts/access/ownable/OwnableInternal.sol';

import { PackageManager } from './logic/PackageManager.sol';

contract Xpm is DiamondBase, OwnableInternal {
    using DiamondBaseStorage for DiamondBaseStorage.Layout;
    using OwnableStorage for OwnableStorage.Layout;

    constructor(IDiamondWritable.FacetCut[] memory cuts, address target, bytes memory data) {

        uint256 x = cuts.length;
        uint256 xx = x + 1;
        uint256 xxx = x + 2;

        IDiamondWritable.FacetCut[] memory facetCuts = new IDiamondWritable.FacetCut[](xxx);

        // cut: custom params
        for (uint256 i; i < x; i++) {
            facetCuts[i] = cuts[i];
        }

        // cut: writable / diamondcutfacet
        PackageManager packagemanager = new PackageManager(address(this));
        bytes4[] memory pmSelectors = new bytes4[](3);
        pmSelectors[0] = PackageManager.install.selector;
        pmSelectors[1] = PackageManager.uninstall.selector;
        pmSelectors[2] = PackageManager.update.selector;        
        facetCuts[x] = IDiamondWritable.FacetCut({
            target: address(packagemanager),
            action: IDiamondWritable.FacetCutAction.ADD,
            selectors: pmSelectors
        });

        // cut: self
        bytes4[] memory fallbackSelectors = new bytes4[](2);
        fallbackSelectors[0] = Xpm.getFallbackAddress.selector;
        fallbackSelectors[1] = Xpm.setFallbackAddress.selector;
        facetCuts[xx] = IDiamondWritable.FacetCut({
            target: address(this),
            action: IDiamondWritable.FacetCutAction.ADD,
            selectors: fallbackSelectors
        });

        DiamondBaseStorage.layout().diamondCut(facetCuts, target, data);
        OwnableStorage.layout().owner = msg.sender;
    }
    receive() external payable {}

    /**
     * @notice get the address of the fallback contract
     * @return fallback address
     */
    function getFallbackAddress() external view returns (address) {
        return DiamondBaseStorage.layout().fallbackAddress;
    }

    /**
     * @notice set the address of the fallback contract
     * @param fallbackAddress fallback address
     */
    function setFallbackAddress(address fallbackAddress) external onlyOwner {
        DiamondBaseStorage.layout().fallbackAddress = fallbackAddress;
    }
}