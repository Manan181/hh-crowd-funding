require("dotenv").config();
const { ethers } = require("hardhat");
const CrowdFundingContract = require("../build/artifacts/contracts/CrowdFundingContract.sol/CrowdFundingContract.json");
const { getLatestBlockTimeStamp, convertToWei, convertToEther, getProvider } = require("../utils/utils");

const getCampaign = async (to) => {
    const crowdFundingInstance = new ethers.Contract(to, CrowdFundingContract.abi, getProvider());
    return crowdFundingInstance;
}

module.exports = {
    withdrawMilestone: async (req, res) => {
        try {
            const { campaignAddress, campaignOwnerAddress, campaignOwnerAddressPrivateKey } = req.body;
            const campaignInstance = await getCampaign(campaignAddress);

            // const signer = await campaignInstance.provider.getSigner(campaignOwnerAddress);
            const signer = new ethers.Wallet(campaignOwnerAddressPrivateKey, getProvider()); // For Infura Provider
            
            const txResponse = await campaignInstance.connect(signer).withdrawMilestone();
            const txReceipt = await txResponse.wait();

            if (txReceipt?.events[0]?.event !== "MilestoneRejected") {
                return res.status(200).send({ message: "Success", data: txReceipt });
            } else {
                return res.status(200).send({ message: "Failed to withdraw funds", data: txReceipt });
            }
        } catch (error) {
            error.body = JSON.parse(error.body);
            error.requestBody = JSON.parse(error.requestBody);
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    voteOnMilestone: async (req, res) => {
        try {
            const { vote, fromAddress, fromAddressPrivateKey, campaignAddress } = req.body;
            const campaignInstance = await getCampaign(campaignAddress);
            // const signer = await campaignInstance.provider.getSigner(fromAddress);
            const signer = new ethers.Wallet(fromAddressPrivateKey, getProvider()); // For Infura Provider
            const txResponse = await campaignInstance.connect(signer).voteOnMilestone(vote);
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    createNewMilestone: async (req, res) => {
        try {
            const { milestoneCID, votingPeriod, campaignOwnerAddress, campaignOwnerAddressPrivateKey, campaignAddress } = req.body;
            const newVotingPeriod = await getLatestBlockTimeStamp() + votingPeriod;
            const campaignInstance = await getCampaign(campaignAddress);

            // const signer = await campaignInstance.provider.getSigner(campaignOwnerAddress);
            const signer = new ethers.Wallet(campaignOwnerAddressPrivateKey, getProvider()); // For Infura Provider
            const txResponse = await campaignInstance.connect(signer).createNewMilestone(milestoneCID, newVotingPeriod);
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    makeDonation: async (req, res) => {
        try {
            const { value, fromAddress, campaignAddress, fromAddressPrivateKey } = req.body;
            if (!value || !fromAddress || !fromAddressPrivateKey || !campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const weiValue = convertToWei(value);
            const campaignInstance = await getCampaign(campaignAddress);
            
            // const signer = await campaignInstance.provider.getSigner(fromAddress);
            const signer = new ethers.Wallet(fromAddressPrivateKey, getProvider()); // For Infura Provider
            
            const crowdFunding = await campaignInstance.connect(signer).makeDonation({ value: weiValue });
            const receipt = await crowdFunding.wait();
            return res.status(200).send({ message: "Success", data: receipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    etherBalance: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const balance = await campaignInstance.etherBalance();
            const balanceInEther = convertToEther(balance);
            return res.status(200).send({ message: "Success", data: { balanceInEther } });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getDonation: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const donation = await campaignInstance.getDonation();
            const donationInEther = convertToEther(donation);
            return res.status(200).send({ message: "Success", data: { donationInEther: donationInEther } });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    campaignOwner: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const campaign_owner = await campaignInstance.campaignOwner();
            return res.status(200).send({ message: "Success", data: { campaignOwner: campaign_owner } });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    numberOfDonors: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const donorsTotal = await campaignInstance.numberOfDonors();
            return res.status(200).send({ message: "Success", data: { Number_Of_Donors: donorsTotal.toString() }});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    showCurrentMilestone: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const currMilestone = await campaignInstance.showCurrentMilestone();
            return res.status(200).send({ message: "Success", data: { currentMilestone: {
                milestoneCID: currMilestone[0],
                approved: currMilestone[1],
                votingPeriod: currMilestone[2].toString(),
                status: currMilestone[3],
                votes: currMilestone[4]
            }}});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getCampaignDuration: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const campaignDuration = await campaignInstance.getCampaignDuration();
            return res.status(200).send({ message: "Success", data: { campaignDuration: campaignDuration.toString() }});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getTargetAmount: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const targetAmount = await campaignInstance.getTargetAmount();
            const balanceInEther = convertToEther(targetAmount);
            return res.status(200).send({ message: "Success", data: { targetAmount: balanceInEther }});
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getFundingCId: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const fundingCID = await campaignInstance.getFundingCId();
            return res.status(200).send({ message: "Success", data: { fundingCID } });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    getCampaignEnded: async (req, res) => {
        try {
            const { campaignAddress } = req.body;
            if (!campaignAddress) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const campaignInstance = await getCampaign(campaignAddress);
            const isCampaignEnded = await campaignInstance.getCampaignEnded();
            return res.status(200).send({ message: "Success", data: { isCampaignEnded } });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    }
}
