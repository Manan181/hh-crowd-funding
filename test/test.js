const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { convertToWei, getSigners } = require("../utils/utils");

describe("CrowdFunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function setUpContractUtils() {
    const ONE_YEAR_IN_SECS = 1 * 24 * 60 * 60;
    const ONE_ETH = 1_000_000_000_000_000_000;

    const deposit = ONE_ETH * 0.001;
    const amountToDeposit = await convertToWei("0.001");
    const futureTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    let fundingId = "QmVRyzazgw98tG54hPYaJsC8ssBguUjrK4cmKLqQ8fKmHw";
    let milestoneCID = "Qmanv9jAnJqTdJBESHk8MwANW4AxkCiHAxx6coHAW34xo3";
    // Contracts are deployed using the first signer/account by default
    const { owner, otherAccount, someOtherAccount, accountOne, accountTwo, accountThree, accountFour } = await getSigners();

    // deploy the contracts here
    const CrowdFundingImplementation = await ethers.getContractFactory("CrowdFundingContract");
    const crowdFundingImplementation = await CrowdFundingImplementation.deploy();
    await crowdFundingImplementation.deployed();

    // deploy the factory contract
    const CrowdFundingFactory = await ethers.getContractFactory("CrowdSourcingFactory");
    const crowdFundingFactory = await CrowdFundingFactory.deploy(crowdFundingImplementation.address);
    await crowdFundingFactory.deployed();

    // creating first clone
    let txn = await crowdFundingFactory.connect(otherAccount).createCrowdFundingContract(fundingId, deposit, futureTime, { value: deposit });
    let wait = await txn.wait();
    const cloneAddress = wait.events[1].args.cloneAddress;
    // load the clone
    let instanceOne = await ethers.getContractAt("CrowdFundingContract", cloneAddress, otherAccount);

    // creating second clone
    let txnTwo = await crowdFundingFactory.connect(otherAccount).createCrowdFundingContract(fundingId, deposit, futureTime, { value: deposit });
    let waitTwo = await txnTwo.wait();
    const cloneAddressTwo = waitTwo.events[1].args.cloneAddress;
    // load the clone
    let instanceTwo = await ethers.getContractAt("CrowdFundingContract", cloneAddressTwo, someOtherAccount);

    return { futureTime, deposit, owner, otherAccount, someOtherAccount, contractFactory: crowdFundingFactory, fundingId, amountToDeposit, instanceOne, instanceTwo, milestoneCID, accountOne, accountTwo, accountThree, accountFour };
  }

  describe("Contract Factory test suite", function () {
    it("Should create a clone contract and create a new campaign", async function () {
      const { contractFactory, otherAccount, deposit, futureTime, fundingId } = await loadFixture(setUpContractUtils);
      const txn = await contractFactory.connect(otherAccount).createCrowdFundingContract(fundingId, deposit, futureTime, { value: deposit });
      let wait = await txn.wait();
      expect(wait.events[1].args.cloneAddress).to.exist;
    });

    it("Should show deployed contracts as two", async function () {
      const { contractFactory } = await loadFixture(setUpContractUtils);
      const deployedContracts = await contractFactory.deployedContracts();
      expect(+deployedContracts.length).to.be.equal(2);
    });

    it("Should only allow the owner to withdraw", async function () {
      const { contractFactory, owner } = await loadFixture(setUpContractUtils);
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await contractFactory.connect(owner).withdrawFunds();
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(+balanceAfter.toString()).to.be.greaterThan(+balanceBefore.toString());
    });
  });

  describe("Crowd funding test suite", function () {
    it("Should be able to make donation to a campaign", async function () {
      const { amountToDeposit, someOtherAccount, instanceOne } = await loadFixture(setUpContractUtils);
      await instanceOne.connect(someOtherAccount).makeDonation({ value: amountToDeposit });
      const amount = (await instanceOne.getCampaignInfo())[5];
      expect(amount.toString()).to.be.equal(amountToDeposit.toString());
    });

    it("Should be able to deposit to the other campaign", async function () {
      const { amountToDeposit, someOtherAccount, instanceTwo } = await loadFixture(setUpContractUtils);
      await instanceTwo.connect(someOtherAccount).makeDonation({ value: amountToDeposit });
      const amount = (await instanceTwo.getCampaignInfo())[5];
      expect(amount.toString()).to.be.equal(amountToDeposit.toString());
    });

    it("Should be able to retrieve the campaign owner", async function () {
      const { otherAccount, instanceOne } = await loadFixture(setUpContractUtils);
      const owner = (await instanceOne.getCampaignInfo())[0];
      expect(owner).to.be.equal(otherAccount.address);
    });

    it("Should be able to get the number of unique donors", async function () {
      const { instanceOne, amountToDeposit, otherAccount, someOtherAccount } = await loadFixture(setUpContractUtils);
      await instanceOne.connect(otherAccount).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(someOtherAccount).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).makeDonation({ value: amountToDeposit });
      expect((await instanceOne.getCampaignInfo())[4]).to.be.equal(2);
    });

    it("Should be able to create a milestone", async function () {
      const { instanceOne, otherAccount, milestoneCID } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      const milestone = (await instanceOne.getCampaignInfo())[6];
      const status = milestone.status;
      expect(status).to.be.equal(2);
    });

    it("Should not be to create a milestone", async function () {
      const { instanceOne, accountFour, milestoneCID } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await expect(instanceOne.connect(accountFour).createNewMilestone(milestoneCID, votingPeriod)).to.be.revertedWithCustomError(instanceOne, "NotOwner");
    });

    it("Should not be able to create a milestone", async function () {
      const { instanceOne, otherAccount, milestoneCID } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await expect(instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod)).to.be.revertedWithCustomError(instanceOne, "MilestonePending");
    });

    it("Should be able to vote on a milestone", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const milestone = (await instanceOne.getCampaignInfo())[6];
      expect(+milestone.votes.length).to.be.equal(3);
    });

    it("Should not be able to vote on a milestone", async function () {
      const { instanceOne, otherAccount, milestoneCID, accountOne } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await expect(instanceOne.connect(accountOne).voteOnMilestone(true)).to.be.revertedWithCustomError(instanceOne, "NotADonor");
    });

    it("Should not be able to vote twice on a milestone", async function () {
      const { instanceOne, otherAccount, milestoneCID, accountThree, amountToDeposit } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountThree).voteOnMilestone(true);
      await expect(instanceOne.connect(accountThree).voteOnMilestone(false)).to.be.revertedWithCustomError(instanceOne, "AlreadyVoted");
      const milestone = (await instanceOne.getCampaignInfo())[6];
      expect(+milestone.votes.length).to.be.equal(1);
    });

    it("Should not be able to withdraw milestone fund because voting period has not ended", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const balanceBefore = await ethers.provider.getBalance(otherAccount.address);
      console.log("🚀 ~ file: test.js:184 ~ balanceBefore:", balanceBefore);
      await expect(instanceOne.connect(otherAccount).withdrawMilestone()).to.be.revertedWithCustomError(instanceOne, "VotingStillOn");
      const balanceAfter = await ethers.provider.getBalance(otherAccount.address);
      console.log("🚀 ~ file: test.js:188 ~ balanceAfter:", balanceAfter);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 1756713021);
    });

    it("Should be able to withdraw milestone fund stage one", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      const campaignInfoBefore = await instanceOne.getCampaignInfo();
      await instanceOne.connect(otherAccount).withdrawMilestone();
      const campaignInfoAfter = await instanceOne.getCampaignInfo();
      expect(+campaignInfoBefore[9].toString()).to.be.greaterThan(+campaignInfoAfter[9].toString());
    });

    it("Should be able to withdraw milestone fund stage two", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, someOtherAccount, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //create new milestone instance
      const campaignInfoBefore = await instanceOne.getCampaignInfo();
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //second milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      const campaignInfoAfter = await instanceOne.getCampaignInfo();
      expect(+campaignInfoBefore[9].toString()).to.be.greaterThan(+campaignInfoAfter[9].toString());
    });

    it("Should be able to withdraw milestone fund stage three", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //create new milestone instance
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //second milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //third milestone creation
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //third milestone withdrawal
      const campaignInfoBefore = await instanceOne.getCampaignInfo();
      await instanceOne.connect(otherAccount).withdrawMilestone();
      const campaignInfoAfter = await instanceOne.getCampaignInfo();
      expect(+campaignInfoBefore[9].toString()).to.be.greaterThan(+campaignInfoAfter[9].toString());
    });

    it("Should no longer be able to create milestone after 3 withdrawals", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //create new milestone instance
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //second milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //third milestone creation
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //third milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      await expect(instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000)).to.be.revertedWithCustomError(instanceOne, "Completed_3_Milestones");
    });

    it("Should no longer be able to donate after the 3 milestone withdrawal", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //create new milestone instance
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //second milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //third milestone creation
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + 1000000);
      //third milestone withdrawal
      await instanceOne.connect(otherAccount).withdrawMilestone();
      await expect(instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit })).to.be.revertedWithCustomError(instanceOne, "CampaignEnded");
    });

    it("created milestone fails insufficient vote", async function () {
      const { instanceOne,otherAccount,milestoneCID,amountToDeposit,accountOne,accountTwo,accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(false);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + 90000000000);
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //get the milestone
      const milestone = (await instanceOne.getCampaignInfo())[6];
      expect(milestone.status).to.be.equal(1);
    });

    it("created milestone should fails first and pass at the second creation", async function () {
      const { instanceOne, otherAccount, milestoneCID, amountToDeposit, accountOne, accountTwo, accountThree } = await loadFixture(setUpContractUtils);
      const votingPeriod = (await time.latest()) + 2 * 24 * 60 * 60;
      await instanceOne.connect(accountOne).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountTwo).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(accountThree).makeDonation({ value: amountToDeposit });
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod);
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(false);
      await instanceOne.connect(accountThree).voteOnMilestone(false);
      const latestTime = await time.latest();
      await time.increaseTo(latestTime + (20000 * 24 * 60 * 60));
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //create another milestone
      await instanceOne.connect(otherAccount).createNewMilestone(milestoneCID, votingPeriod + (3 * 24 * 60 * 60));
      await instanceOne.connect(accountOne).voteOnMilestone(true);
      await instanceOne.connect(accountTwo).voteOnMilestone(true);
      await instanceOne.connect(accountThree).voteOnMilestone(true);
      await time.increaseTo(latestTime + (21000 * 24 * 60 * 60));
      //withdraw now
      await instanceOne.connect(otherAccount).withdrawMilestone();
      //get the milestone
      const milestone = (await instanceOne.getCampaignInfo())[6];
      expect(milestone.status).to.be.equal(0);
    });
  });
});