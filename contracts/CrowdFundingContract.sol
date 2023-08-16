//SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error MilestoneNotPending();
error Completed_3_Milestones();
error NotOwner();
error CampaignEnded();
error MilestonePending();
error NotADonor();
error VotingStillOn();
error WithdrawalFailed();
error InsufficientFunds();
error AlreadyVoted();
error InvalidDuration();
error RefundAlreadyInitiated();
error RefundAlreadyClaimed();
error FundingPeriodStillOn();
error UpkeepNotNeeded();

contract CrowdFundingContract is Initializable, AutomationCompatibleInterface {
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
    uint32 private sMilestoneCounter;
    uint32 private sNumberOfWithdrawal;
    uint256 private sAmountDonated;
    uint256 private sNumberOfDonors;
    uint256 private sFundingGoal;
    uint256 private sCampaignDuration;
    uint256 private constant BASE_NUMBER = 10 ** 18;
    string private sFundingCId;
    bool private sCampaignEnded;
    MilestoneStatus private status;
    address payable private sCampaignOwner;
    uint256 public refundTimestamp;
    bool private refundInitiated;

    address[] private sdonorAddresses;

    mapping(address => uint256) public donors;
    mapping(uint256 => Milestone) public milestones;
    mapping(address => uint256) private refundableAmounts;
    mapping(address => bool) private refundClaimed;

    // Events
    event FundsDonated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event MilestoneCreated(address indexed owner, uint256 period);
    event MilestoneRejected(uint yesvote, uint novote);
    event MilestoneVoted(uint32 milestoneCounter, address voter, bool vote);
    event RefundFailed(address donor, uint256 amount);
    event RefundInitiated();
    
    // Functions
    function initialize(string calldata _fundingCId, uint256 _amount, uint256 _duration) external initializer {
        if (_duration <= 0) {
            revert InvalidDuration();
        }
        sCampaignOwner = payable(tx.origin);
        sFundingCId = _fundingCId;
        sFundingGoal = _amount;
        sCampaignDuration = _duration;
        refundTimestamp = block.timestamp + _duration;
    }

    receive() external payable {}

    function makeDonation() external payable {
        if (sCampaignEnded) revert CampaignEnded();
        if (msg.value <= 0) revert InsufficientFunds();
        if (sNumberOfWithdrawal == 3) revert Completed_3_Milestones();

        if (donors[msg.sender] == 0) {
            sNumberOfDonors += 1;
            sdonorAddresses.push(msg.sender);
        }

        refundableAmounts[msg.sender] += msg.value;

        donors[msg.sender] += msg.value;
        sAmountDonated += msg.value;
        emit FundsDonated(msg.sender, msg.value);
    }

    function createNewMilestone(string memory milestoneCID, uint256 votingPeriod) external {
        if (msg.sender != sCampaignOwner) {
            revert NotOwner();
        }
        //check if we have a pending milestone or no milestone at all
        if (milestones[sMilestoneCounter].status == MilestoneStatus.Pending) {
            revert MilestonePending();
        }
        //check if all three milestone has been withdrawn
        if (sNumberOfWithdrawal == 3) {
            revert Completed_3_Milestones();
        }
        //create a new milestone increment the milestonecounter
        sMilestoneCounter++;
        //voting period for a minimum of 2 weeks before the proposal fails or passes
        Milestone storage newmilestone = milestones[sMilestoneCounter];
        newmilestone.milestoneCID = milestoneCID;
        newmilestone.approved = false;
        newmilestone.votingPeriod = votingPeriod;
        newmilestone.status = MilestoneStatus.Pending;
        emit MilestoneCreated(msg.sender, votingPeriod);
    }

    function voteOnMilestone(bool vote) external {
        Milestone storage currentMilestone = milestones[sMilestoneCounter];
        // Check if the milestone is pending which means we can vote
        if (currentMilestone.status != MilestoneStatus.Pending) {
            revert MilestoneNotPending();
        }
        if (donors[msg.sender] == 0) {
            revert NotADonor();
        }
        // Check if the sender has already voted
        for (uint256 counter; counter < currentMilestone.votes.length; ++counter) {
            if (currentMilestone.votes[counter].donorAddress == msg.sender) {
                revert AlreadyVoted();
            }
        }
        // Push a new vote using memory instance
        currentMilestone.votes.push(MilestoneVote({ donorAddress: msg.sender, vote: vote }));
        // Emit an event to track the vote
        emit MilestoneVoted(sMilestoneCounter, msg.sender, vote);
    }

    function withdrawMilestone() external {
        if (msg.sender != sCampaignOwner) {
            revert NotOwner();
        }
        if (block.timestamp <= milestones[sMilestoneCounter].votingPeriod) revert VotingStillOn();
        // if (block.timestamp < refundTimestamp) revert FundingPeriodStillOn();
        
        Milestone storage currentMilestone = milestones[sMilestoneCounter];
        if (block.timestamp <= currentMilestone.votingPeriod) {
            revert VotingStillOn();
        }
        if (currentMilestone.status != MilestoneStatus.Pending) {
            revert MilestoneNotPending();
        }

        (uint yesVotes, uint256 noVotes) = _calculateTheVote(currentMilestone.votes);
        uint256 totalYesVotes = (sNumberOfDonors - noVotes) * BASE_NUMBER;
        uint256 twoThirdsTotal = (2 * sNumberOfDonors * BASE_NUMBER) / 3;

        if (totalYesVotes >= twoThirdsTotal) {
            currentMilestone.approved = true;
            sNumberOfWithdrawal++;
            currentMilestone.status = MilestoneStatus.Approved;

            uint256 contractBalance = address(this).balance;
            if (contractBalance == 0) {
                revert InsufficientFunds();
            }

            uint256 amountToWithdraw;
            if (sNumberOfWithdrawal == 1) {
                amountToWithdraw = contractBalance / 3;
            } else if (sNumberOfWithdrawal == 2) {
                amountToWithdraw = contractBalance / 2;
            } else {
                amountToWithdraw = contractBalance;
                sCampaignEnded = true;
            }

            (bool success, ) = sCampaignOwner.call{ value: amountToWithdraw }("");
            if (!success) {
                revert WithdrawalFailed();
            }
            emit FundsWithdrawn(sCampaignOwner, amountToWithdraw);
        } else {
            currentMilestone.status = MilestoneStatus.Declined;
            emit MilestoneRejected(yesVotes, noVotes);
        }
    }

    function checkUpkeep(bytes memory /* checkData */) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        // bool timePassed = block.timestamp >= refundTimestamp;
        bool fundingGoalNotReached = sAmountDonated < sFundingGoal;
        bool campaignNotEnded = !sCampaignEnded;
        upkeepNeeded = (fundingGoalNotReached && campaignNotEnded);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (refundInitiated) revert RefundAlreadyInitiated();
        if (!upkeepNeeded) revert UpkeepNotNeeded();

        // Initiate the refund process
        refundInitiated = true;
        emit RefundInitiated();
        uint256 donorsLength = sdonorAddresses.length;
        for (uint256 counter = 0; counter < donorsLength; ++counter) {
            address donor = sdonorAddresses[counter];
            if (!refundClaimed[donor]) {
                refundClaimed[donor] = true;
                uint256 refundAmount = refundableAmounts[donor];
                refundableAmounts[donor] = 0;
                (bool success, ) = donor.call{ value: refundAmount }("");
                if (!success) emit RefundFailed(donor, refundAmount);
            }
        }
    }

    function _calculateTheVote(MilestoneVote[] memory votesArray) private pure returns (uint256, uint256) {
        uint256 yesNumber = 0;
        uint256 noNumber = 0;
        uint256 counter = 0;
        for (counter; counter < votesArray.length; ++counter) {
            if (votesArray[counter].vote == true) {
                ++yesNumber;
            } else {
                ++noNumber;
            }
        }
        return (yesNumber, noNumber);
    }

    function etherBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getDonation() external view returns (uint256) {
        return sAmountDonated;
    }

    function campaignOwner() external view returns (address payable) {
        return sCampaignOwner;
    }

    function numberOfDonors() external view returns (uint256) {
        return sNumberOfDonors;
    }

    function showCurrentMilestone() external view returns (Milestone memory) {
        return milestones[sMilestoneCounter];
    }

    function getCampaignDuration() external view returns (uint256) {
        return sCampaignDuration;
    }

    function getTargetAmount() external view returns (uint256) {
        return sFundingGoal;
    }

    function getFundingCId() external view returns (string memory) {
        return sFundingCId;
    }

    function getCampaignEnded() external view returns (bool) {
        return sCampaignEnded;
    }

    function getMilestoneStatus() external view returns (MilestoneStatus) {
        return status;
    }
}
