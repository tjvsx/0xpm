// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract MyTokenLens {
    enum Function { TRANSFER, GET }
    address owner;
    address diamondAddress;
    mapping(Function => string) functions;
    
    constructor(address _owner, address _diamondAddress) {
        owner = _owner;
        diamondAddress = _diamondAddress;


        functions[Function.TRANSFER] =  "transfer_1()";
    }

    function setFunction(Function fn, string memory diamondFn) external {
        require(address(msg.sender) == owner, "Only owner can set functions");
        functions[fn] = diamondFn;
    }

    function tranfer (uint256 amount) external {
        bytes memory test = abi.encodeWithSignature(functions[Function.TRANSFER], amount);
        
        // here there should be some tweaks in order to make it work because msg.sender changes, so the function in the diamond has to handle this
        diamondAddress.call(test);
    }
    
}
