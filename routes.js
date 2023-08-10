const express = require("express");
const router = express.Router();
const crowdSourcingFactoryController = require("./controller/crowdSourcingFactory.controller");
const crowdFundingContractController = require("./controller/crowdFundingContract.controller");

// Crowd Funding Contract Routes
router.post("/makeDonation", crowdFundingContractController.makeDonation);

router.post("/createNewMilestone", crowdFundingContractController.createNewMilestone);

router.post("/voteOnMilestone", crowdFundingContractController.voteOnMilestone);

router.post("/withdrawMilestone", crowdFundingContractController.withdrawMilestone);

router.get("/etherBalance", crowdFundingContractController.etherBalance);

router.get("/getDonation", crowdFundingContractController.getDonation);

router.get("/campaignOwner", crowdFundingContractController.campaignOwner);

router.get("/numberOfDonors", crowdFundingContractController.numberOfDonors);

router.get("/showCurrentMilestone", crowdFundingContractController.showCurrentMilestone);

router.get("/getCampaignDuration", crowdFundingContractController.getCampaignDuration);

router.get("/getTargetAmount", crowdFundingContractController.getTargetAmount);

router.get("/getFundingCId", crowdFundingContractController.getFundingCId);

router.get("/getCampaignEnded", crowdFundingContractController.getCampaignEnded);

// Crowd Sourcing Factory Routes
router.post("/createCrowdFundingContract", crowdSourcingFactoryController.createCrowdFundingContract);

router.get("/deployedContracts", crowdSourcingFactoryController.getDeployedContracts);

router.post("/withdrawFunds", crowdSourcingFactoryController.withdrawFunds);

module.exports = router;
