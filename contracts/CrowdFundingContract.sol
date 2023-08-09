//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract CrowdFundingContract is Initializable {
    // Type Declarations
    enum MilestoneStatus {
        Approved,
        Declined,
        Pending
    }
    struct MilestoneVote {
        address donorAddress;
        bool vote;
    }
    struct Milestone {
        string milestoneCID;
        bool approved;
        uint256 votingPeriod;
        MilestoneStatus status;
        MilestoneVote[] votes;
    }
    
    // State Variables
    bool private sCampaignEnded;
    address payable private sCampaignOwner;
    string private sFundingCId;
    uint256 private sTargetAmount;
    uint256 private sCampaignDuration;
    uint256 private sAmountDonated;
    uint256 private sNumberOfDonors;
    uint32 private sMilestoneCounter;
    uint256 private sApprovedMilestone;
    uint256 private sNumberOfWithdrawal;
    uint256 private constant BASE_NUMBER = 10**18;
    MilestoneStatus public status;

    mapping(address => uint256) public donors;
    mapping(uint256 => Milestone) public milestones;

    // Events
    event FundsDonated(address indexed donor, uint256 amount, uint256 date);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 date);
    event MilestoneCreated(
        address indexed owner,
        uint256 datecreated,
        uint256 period
    );
    event MilestoneRejected(uint yesvote, uint novote);

    // Functions
    function initialize(string calldata _fundingCId, uint256 _amount, uint256 _duration) external initializer {
        sCampaignOwner = payable(tx.origin);
        sFundingCId = _fundingCId;
        sTargetAmount = _amount;
        sCampaignDuration = _duration;
    }
    
    receive() external payable {}

    function makeDonation() public payable {
        uint256 funds = msg.value;
        require(!sCampaignEnded, "campaign ended");
        require(funds > 0, "You did not donate");
        require(sNumberOfWithdrawal != 3, "no longer taking donation");
        if (donors[msg.sender] == 0) {
            sNumberOfDonors += 1;
        }

        donors[msg.sender] += funds;
        sAmountDonated += funds;
        emit FundsDonated(msg.sender, funds, block.timestamp);
    }

    function creatNewMilestone(string memory milestoneCID, uint256 votingPeriod) public {
        require(msg.sender == sCampaignOwner, "you not the owner");
        //check if we have a pending milestone
        //check if we have a pending milestone or no milestone at all
        require(
            milestones[sMilestoneCounter].status != MilestoneStatus.Pending,
            "you have a pending milestone"
        );

        //check if all three milestone has been withdrawn
        require(sNumberOfWithdrawal != 3, "no more milestone to create");

        //create a new milestone increment the milestonecounter
        sMilestoneCounter++;

        //voting period for a minimum of 2 weeks before the proposal fails or passes
        Milestone storage newmilestone = milestones[sMilestoneCounter];
        newmilestone.milestoneCID = milestoneCID;
        newmilestone.approved = false;
        newmilestone.votingPeriod = votingPeriod;
        newmilestone.status = MilestoneStatus.Pending;
        emit MilestoneCreated(msg.sender, block.timestamp, votingPeriod);
    }

    function voteOnMilestone(bool vote) public {
        //check if the milestone is pending which means we can vote
        require(
            milestones[sMilestoneCounter].status == MilestoneStatus.Pending,
            "can not vote on milestone"
        );
        //check if the person has voted already
        //milestone.votes

        //check if this person is a donor to the cause
        require(donors[msg.sender] != 0, "you are not a donor");

        uint256 counter = 0;
        uint256 milestoneVoteArrayLength = milestones[sMilestoneCounter]
            .votes
            .length;
        bool voted = false;
        for (counter; counter < milestoneVoteArrayLength; ++counter) {
            MilestoneVote memory userVote = milestones[sMilestoneCounter].votes[
                counter
            ];
            if (userVote.donorAddress == msg.sender) {
                //already voted
                voted = true;
                break;
            }
        }
        if (!voted) {
            //the user has not voted yet
            MilestoneVote memory userVote;
            //construct the user vote
            userVote.donorAddress = msg.sender;
            userVote.vote = vote;
            milestones[sMilestoneCounter].votes.push(userVote);
            
        }
    }

    function withdrawMilestone() public {
        require(payable(msg.sender) == sCampaignOwner, "you not the owner");

        //check if the voting period is still on
        require(
            block.timestamp > milestones[sMilestoneCounter].votingPeriod,
            "voting still on"
        );
        //check if milestone has ended
        require(
            milestones[sMilestoneCounter].status == MilestoneStatus.Pending,
            "milestone ended"
        );

        //calculate the percentage
        (uint yesvote, uint256 novote) = _calculateTheVote(
            milestones[sMilestoneCounter].votes
        );

        //calculate the vote percentage and make room for those that did not vote
        uint256 totalYesVote = sNumberOfDonors - novote;

        //check if the yesVote is equal to 2/3 of the total votes
        uint256 twoThirdofTotal = (2 * sNumberOfDonors * BASE_NUMBER) / 3;
        uint256 yesVoteCalculation = totalYesVote * BASE_NUMBER;

        //check if the milestone passed 2/3
        if (yesVoteCalculation >= twoThirdofTotal) {
            //the milestone succeds payout the money
            milestones[sMilestoneCounter].approved = true;
            sNumberOfWithdrawal++;
            milestones[sMilestoneCounter].status = MilestoneStatus.Approved;
            //transfer 1/3 of the total balance of the contract
            uint256 contractBalance = address(this).balance;
            require(contractBalance > 0, "nothing to withdraw");
            uint256 amountToWithdraw;
            if (sNumberOfWithdrawal == 1) {
                //divide by 3 1/3
                amountToWithdraw = contractBalance / 3;
            } else if (sNumberOfWithdrawal == 2) {
                //second withdrawal 1/2
                amountToWithdraw = contractBalance / 2;
            } else {
                //final withdrawal
                amountToWithdraw = contractBalance;
                sCampaignEnded = true;
            }

            (bool success, ) = sCampaignOwner.call{value: amountToWithdraw}("");
            require(success, "withdrawal failed");
            emit FundsWithdrawn(
                sCampaignOwner,
                amountToWithdraw,
                block.timestamp
            );
            
        } else {
            //the milestone failed
            milestones[sMilestoneCounter].status = MilestoneStatus.Declined;
            emit MilestoneRejected(yesvote, novote);
        }
    }

    function _calculateTheVote(MilestoneVote[] memory votesArray) private pure returns (uint256, uint256) {
        uint256 yesNumber = 0;
        uint256 noNumber = 0;
        uint256 arrayLength = votesArray.length;
        uint256 counter = 0;

        for (counter; counter < arrayLength; ++counter) {
            if (votesArray[counter].vote == true) {
                ++yesNumber;
            } else {
                ++noNumber;
            }
        }

        return (yesNumber, noNumber);
    }
    
    function etherBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getDonation() public view returns (uint256) {
        return sAmountDonated;
    }

    function campaignOwner() public view returns (address payable) {
        return sCampaignOwner;
    }

    function numberOfDonors() public view returns (uint256) {
        return sNumberOfDonors;
    }

    function showCurrentMillestone() public view returns (Milestone memory) {
        return milestones[sMilestoneCounter];
    }

    function getCampaignDuration() public view returns (uint256) {
        return sCampaignDuration;
    }

    function getTargetAmount() public view returns (uint256) {
        return sTargetAmount;
    }

    function getFundingCId() public view returns (string memory) {
        return sFundingCId;
    }

    function getCampaignEnded() public view returns (bool) {
        return sCampaignEnded;
    }
}
