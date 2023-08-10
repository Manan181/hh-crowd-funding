require("dotenv").config();
const { ethers } = require("hardhat");
const CrowdSourcingFactory = require("../build/artifacts/contracts/CrowdSourcingFactory.sol/CrowdSourcingFactory.json");
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
const crowdSourcingFactory = new ethers.Contract(process.env.CONTRACT_ADDRESS, CrowdSourcingFactory.abi, provider);

const getSigner = async () => {
    const [owner, otherAccount, someOtherAccount, accountOne, accountTwo, accountThree, accountFour] = await ethers.getSigners();
    return { owner, otherAccount, someOtherAccount, accountOne, accountTwo, accountThree, accountFour };
}

module.exports = {
    createCrowdFundingContract: async (req, res) => {
        try {
            const { fundingCID, deposit, duration, address } = req.body;
            if (!fundingCID || !deposit || !duration || !address) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const signer = await crowdSourcingFactory.provider.getSigner(address);
            const crowdFunding = await crowdSourcingFactory.connect(signer).createCrowdFundingContract(fundingCID, deposit, duration, { value: deposit });
            const receipt = await crowdFunding.wait();
            return res.status(200).send({ message: "Success", data: receipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getDeployedContracts: async (req, res) => {
        try {
            const deployedContracts = await crowdSourcingFactory.deployedContracts();
            return res.status(200).send({ message: "Success", data: { deployedContracts }});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    withdrawFunds: async (req, res) => {
        try {
            const { owner } = await getSigner();
            const txResponse = await crowdSourcingFactory.connect(owner).withdrawFunds();
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getSigner
};
