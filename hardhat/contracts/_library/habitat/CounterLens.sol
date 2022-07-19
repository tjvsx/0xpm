// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract CounterLens {
    enum Function { INCREMENT, GET }
    address owner;
    address diamondAddress;
    mapping(Function => string) functions;
    
    constructor(address _owner, address _diamondAddress) {
        owner = _owner;
        diamondAddress = _diamondAddress;
        functions[Function.INCREMENT] =  "setCounter(uint256)";
    }

    function setFunction(Function fn, string memory diamondFn) external {
        require(address(msg.sender) == owner, "Only owner can set functions");
        functions[fn] = diamondFn;
    }

    function increment (uint256 amount) external {
        bytes memory test = abi.encodeWithSignature(functions[Function.INCREMENT], amount);
        
        // here there should be some tweaks in order to make it work because msg.sender changes, so the function in the diamond has to handle this
        diamondAddress.call(test);
    }
    
}
