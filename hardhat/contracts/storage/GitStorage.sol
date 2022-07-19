// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import { EnumerableSet } from '@solidstate/contracts/utils/EnumerableSet.sol';

library GitStorage {
  using EnumerableSet for EnumerableSet.AddressSet;

  struct Repo {
    EnumerableSet.AddressSet commits;
    EnumerableSet.AddressSet subscribers;
  }

  struct Account {
    // upgrade names => repo (upgrade contracts / commit addresses);
    mapping(string => Repo) repo;
  }
  
  struct Layout {
    //owner => registration info
    mapping(address => Account) account;
  }

  bytes32 internal constant STORAGE_SLOT =
      keccak256('0xpm.repositories.git.storage');

  event Committed (
    address owner,
    string name,
    address upgrade
  );

  function layout() internal pure returns (Layout storage l) {
      bytes32 slot = STORAGE_SLOT;
      assembly {
          l.slot := slot
      }
  }

  function commit(
    Layout storage l,
    address owner,
    string memory name,
    address upgrade
  ) internal {
    EnumerableSet.AddressSet storage c = l.account[owner].repo[name].commits;
    c.add(upgrade);
    emit Committed(owner, name, upgrade);
  }

  function latest(
    Layout storage l,
    address owner, 
    string memory name
  ) internal view returns (address) {
    EnumerableSet.AddressSet storage c = l.account[owner].repo[name].commits;
    require(c.length() > 0, 'GitStorage: no upgrades available.');
    uint256 i = c.length() - 1;
    return c.at(i);
  }

  function subscribe(Layout storage l, address account, string memory repo, address user) internal {
    EnumerableSet.AddressSet storage s = l.account[account].repo[repo].subscribers;
    s.add(user);
  }

  function unsubscribe(Layout storage l, address account, string memory repo, address user) internal {
    EnumerableSet.AddressSet storage s = l.account[account].repo[repo].subscribers;
    if (s.contains(user)) {
      s.remove(user);
    }
  }

  function isSubscriber(Layout storage l, address account, string memory repo, address user) internal view returns (bool) {
    EnumerableSet.AddressSet storage s = l.account[account].repo[repo].subscribers;
    return s.contains(user);
  }
}
