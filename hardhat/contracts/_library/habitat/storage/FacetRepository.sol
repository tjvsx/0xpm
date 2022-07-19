// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRepository } from "../interfaces/IRepository.sol";

library FacetRepository {
    bytes32 constant FACET_REPOSITORY_STORAGE_POSITION = keccak256("diamond.standard.facetrepo.storage");

    struct FacetRepositoryStorage {
        address repo;
        mapping(address => bool) allowedFacets;
    }

    function facetRepositoryStorage() internal pure returns (FacetRepositoryStorage storage ds) {
        bytes32 position = FACET_REPOSITORY_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function isInRepo(address facet) internal returns (bool) {
        FacetRepository.FacetRepositoryStorage storage frs = facetRepositoryStorage();
        if(frs.allowedFacets[facet]) {
            return true;
        }
        if (frs.repo != address(0)) {
            IRepository repository = IRepository(frs.repo);
            if(repository.isInRepo(facet)) {
                return true;
            }
        }
        return false;
    }
}