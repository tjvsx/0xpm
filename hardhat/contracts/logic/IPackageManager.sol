// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Universally Compatible Diamond Cut Facet w/ Git Control -- by @tjvsx
 * This contract is to be used as a facet of an EIP2535 'Diamond' proxy. It provides multiple 
 * methods for upgrading a diamond, each of which serve a specific contract user type. Additionally,
 * this contract is integrated with a git system that stores the upgrades in another diamond whose
 * sole purpose is to act as an immutable on-chain open-source upgrade repository.
 */
interface IPackageManager {

  event Upgraded (address account, string repo, address toPkg, address fromPkg, address caller);

  function install(address account, string memory repo) external;

  function uninstall(address account, string memory repo, address pkg) external;

  function update(address account, string memory name, address toPkg, address fromPkg) external;
}
