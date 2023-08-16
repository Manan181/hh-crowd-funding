require("dotenv").config();
const { ethers } = require("hardhat");
const CrowdSourcingFactory = require("../build/artifacts/contracts/CrowdSourcingFactory.sol/CrowdSourcingFactory.json");
const { convertToWei, getSigners, getLatestBlockTimeStamp, getProvider } = require("../utils/utils");

const crowdSourcingFactory = new ethers.Contract(process.env.CROWD_SOURCING_CONTRACT_ADDRESS, CrowdSourcingFactory.abi, getProvider());

module.exports = {
    createCrowdFundingContract: async (req, res) => {
        try {
            const { fundingCID, amountToRaise, duration, fromAddress, value, fromAddressPrivateKey } = req.body;
            if (!fundingCID || !amountToRaise || !duration || !fromAddress || !value || !fromAddressPrivateKey) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const depositInWei = convertToWei(value);
            const amountToRaiseInWei = convertToWei(amountToRaise);
            // const signer = await crowdSourcingFactory.provider.getSigner(fromAddress); // For Ganache Provider
            const signer = new ethers.Wallet(fromAddressPrivateKey, getProvider()); // For Infura Provider
            const campaignDuration = await getLatestBlockTimeStamp() + duration;
            
            const crowdFunding = await crowdSourcingFactory.connect(signer).createCrowdFundingContract(fundingCID, amountToRaiseInWei, campaignDuration, { value: depositInWei });
            const receipt = await crowdFunding.wait();
            
            if (receipt?.events[1]?.args.cloneAddress) {
                return res.status(200).send({ message: "Success", data: receipt });
            } else {
                return res.status(200).send({ message: "Failed to create clone", data: receipt });
            }
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getDeployedCampaigns: async (req, res) => {
        try {
            const deployedContracts = await crowdSourcingFactory.deployedContracts();
            return res.status(200).send({ message: "Success", data: { deployedContracts }});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    withdrawFunds: async (req, res) => {
        try {
            const { ownerPrivateKey } = req.body;
            // const { owner } = await getSigners(); // For Ganache Provider
            const signer = new ethers.Wallet(ownerPrivateKey, getProvider()); // For Infura Provider
            const txResponse = await crowdSourcingFactory.connect(signer).withdrawFunds();
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },
};
