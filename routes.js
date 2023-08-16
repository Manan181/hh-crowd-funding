const express = require("express");
const router = express.Router();
const crowdSourcingFactoryController = require("./controller/crowdSourcingFactory.controller");
const crowdFundingContractController = require("./controller/crowdFundingContract.controller");

// Crowd Funding Contract Routes
router.post("/makeDonation", crowdFundingContractController.makeDonation);

router.post("/createNewMilestone", crowdFundingContractController.createNewMilestone);

router.post("/voteOnMilestone", crowdFundingContractController.voteOnMilestone);

router.post("/withdrawMilestone", crowdFundingContractController.withdrawMilestone);

router.post("/etherBalance", crowdFundingContractController.etherBalance);

router.post("/getDonation", crowdFundingContractController.getDonation);

router.post("/campaignOwner", crowdFundingContractController.campaignOwner);

router.post("/numberOfDonors", crowdFundingContractController.numberOfDonors);

router.post("/showCurrentMilestone", crowdFundingContractController.showCurrentMilestone);

router.post("/getCampaignDuration", crowdFundingContractController.getCampaignDuration);

router.post("/getTargetAmount", crowdFundingContractController.getTargetAmount);

router.post("/getFundingCId", crowdFundingContractController.getFundingCId);

router.post("/getCampaignEnded", crowdFundingContractController.getCampaignEnded);

// Crowd Sourcing Factory Routes
router.post("/createCrowdFundingContract", crowdSourcingFactoryController.createCrowdFundingContract);

router.get("/getDeployedCampaigns", crowdSourcingFactoryController.getDeployedCampaigns);

router.post("/withdrawFunds", crowdSourcingFactoryController.withdrawFunds);

module.exports = router;
