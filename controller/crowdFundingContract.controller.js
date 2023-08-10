require("dotenv").config();
const { ethers } = require("hardhat");
const CrowdFundingContract = require("../build/artifacts/contracts/CrowdFundingContract.sol/CrowdFundingContract.json");
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');

const getCampaign = async (to) => {
    const crowdFundingInstance = new ethers.Contract(to, CrowdFundingContract.abi, provider);
    return crowdFundingInstance;
}

const getLatestBlockTimeStamp = async () => {
    const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
    return timeStamp;
}

module.exports = {
    withdrawMilestone: async (req, res) => {
        try {
            const { campaignAddress, campaignOwnerAddress } = req.body;
            const campaignInstance = await getCampaign(campaignAddress);

            const signer = await campaignInstance.provider.getSigner(campaignOwnerAddress);
            const txResponse = await campaignInstance.connect(signer).withdrawMilestone();
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    voteOnMilestone: async (req, res) => {
        try {
            const { vote, fromAddress, campaignAddress } = req.body;
            const campaignInstance = await getCampaign(campaignAddress);

            const signer = await campaignInstance.provider.getSigner(fromAddress);
            const txResponse = await campaignInstance.connect(signer).voteOnMilestone(vote);
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    createNewMilestone: async (req, res) => {
        try {
            const { milestoneCID, votingPeriodInDays, campaignOwnerAddress, campaignAddress } = req.body;
            const votingPeriod = await getLatestBlockTimeStamp() + (votingPeriodInDays * 24 * 60 * 60);
            const campaignInstance = await getCampaign(campaignAddress);

            const signer = await campaignInstance.provider.getSigner(campaignOwnerAddress);
            const txResponse = await campaignInstance.connect(signer).createNewMilestone(milestoneCID, votingPeriod);
            const txReceipt = await txResponse.wait();
            return res.status(200).send({ message: "Success", data: txReceipt });
        } catch (error) {
            return res.status(500).send({ message: "Something went wrong", error });
        }
    },

    makeDonation: async (req, res) => {
        try {
            const { value, fromAddress, to: campaignAddress } = req.body;
            if (!value) {
                return res.status(400).send({ message: "Required fields are missing!" });
            }
            const weiValue = ethers.utils.parseEther(value);
            const instance = await getCampaign(campaignAddress);
            const signer = await instance.provider.getSigner(fromAddress);
            const crowdFunding = await instance.connect(signer).makeDonation({ value: weiValue });
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
            const balanceInEther = ethers.utils.formatEther(balance);
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
            const donationInEther = ethers.utils.formatEther(donation);
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
            return res.status(200).send({ message: "Success", data: { targetAmount: targetAmount.toString() }});
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
