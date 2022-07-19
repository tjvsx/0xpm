// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { SolidStateERC20 } from '@solidstate/contracts/token/ERC20/SolidStateERC20.sol';
import { ERC20MetadataStorage } from '@solidstate/contracts/token/ERC20/metadata/ERC20MetadataStorage.sol';
import { MyTokenInit } from "../storage/MyTokenInit.sol";

contract MyToken is SolidStateERC20 {
    using ERC20MetadataStorage for ERC20MetadataStorage.Layout;

    function initMyToken(string calldata name, string calldata symbol, uint8 decimals, address luckyGuy) public {
        ERC20MetadataStorage.Layout storage l = ERC20MetadataStorage.layout();

        MyTokenInit.MyTokenInitStorage storage mti = MyTokenInit.initStorage();

        require(!mti.isInitialized, 'Contract is already initialized!');
        mti.isInitialized = true;

        l.setName(name);
        l.setSymbol(symbol);
        l.setDecimals(decimals);

        _mint(luckyGuy, 1000);
    }
}