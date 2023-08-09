//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrowdFundingContract.sol";

contract CrowdSourcingFactory is Ownable {
    // state variables;
    address private immutable sCrowdFundingImplementation;
    address[] private sDeployedContracts;
    uint256 private sFundingFee = 0.001 ether;

    // events
    event NewCrowdFundingCreated(address indexed owner, uint256 amount, address cloneAddress, string fundingCID);

    // functions
    constructor(address _implementation) Ownable() {
        sCrowdFundingImplementation = _implementation;
    }

    receive() external payable {}

    function createCrowdFundingContract(string memory _fundingCID, uint256 _amount, uint256 _duration) external payable returns (address) {
        require(msg.value >= sFundingFee, "deposit too small");
        address clone = Clones.clone(sCrowdFundingImplementation);
        (bool success, ) = clone.call(abi.encodeWithSignature("initialize(string,uint256,uint256)", _fundingCID, _amount, _duration));
        require(success, "creation failed");

        sDeployedContracts.push(clone);
        emit NewCrowdFundingCreated(msg.sender, sFundingFee, clone, _fundingCID);
        return clone;
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "nothing to withdraw");
        (bool success, ) = payable(msg.sender).call{ value: balance }("");
        require(success, "withdrawal failed");
    }

    function deployedContracts() public view returns (address[] memory) {
        return sDeployedContracts;
    }
}
