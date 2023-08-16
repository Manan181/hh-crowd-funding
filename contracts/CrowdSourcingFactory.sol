//SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrowdFundingContract.sol";

error InsufficientDeposit();
error CreationFailed();

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
        if (msg.value < sFundingFee) {
            revert InsufficientDeposit();
        }
        address clone = Clones.clone(sCrowdFundingImplementation);
        (bool success, ) = clone.call(abi.encodeWithSignature("initialize(string,uint256,uint256)", _fundingCID, _amount, _duration));
        if (!success) {
            revert CreationFailed();
        }

        sDeployedContracts.push(clone);
        emit NewCrowdFundingCreated(msg.sender, sFundingFee, clone, _fundingCID);
        return clone;
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert InsufficientFunds();
        }
        (bool success, ) = payable(msg.sender).call{ value: balance }("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }

    function deployedContracts() external view returns (address[] memory) {
        return sDeployedContracts;
    }
}
