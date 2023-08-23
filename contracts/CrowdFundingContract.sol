//SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

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
error FundingPeriodStillOn();
error FundingGoalReached();
error RefundDeclined();

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
    uint32 private s_MilestoneCounter;
    uint32 private s_NumberOfWithdrawal;
    uint256 private s_AmountDonated;
    uint256 private s_NumberOfDonors;
    uint256 private s_FundingGoal;
    uint256 private s_CampaignDuration;
    uint256 private constant BASE_NUMBER = 10 ** 18;
    string private s_FundingCId;
    bool private s_CampaignEnded;
    address payable private s_CampaignOwner;
    uint256 public refundTimestamp;
    bool private s_refundInitiated;

    address[] private s_donorAddresses;

    mapping(address => uint256) public s_donors;
    mapping(uint256 => Milestone) public s_milestones;
    mapping(address => uint256) private s_refundableAmounts;
    mapping(address => bool) private s_refundClaimed;

    // Events
    event FundsDonated(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event MilestoneCreated(address indexed owner, uint256 period);
    event MilestoneRejected(uint yesvote, uint novote);
    event MilestoneVoted(uint32 milestoneCounter, address voter, bool vote);
    event RefundFailed(address donor, uint256 amount);
    event RefundInitiated();
    
    // Modifiers
    modifier checkWithdrawal {
        unchecked {
            if (s_NumberOfWithdrawal == 3) revert Completed_3_Milestones();
        }
        _;
    }
    modifier notOwner {
        if (msg.sender != s_CampaignOwner) revert NotOwner();
        _;
    }
    modifier campaignEnded {
        if (s_CampaignEnded) revert CampaignEnded();
        _;
    }
    
    // Functions
    function initialize(string calldata _fundingCId, uint256 _amount, uint256 _duration) external initializer {
        if (_duration <= 0) {
            revert InvalidDuration();
        }
        s_CampaignOwner = payable(tx.origin);
        s_FundingCId = _fundingCId;
        s_FundingGoal = _amount;
        s_CampaignDuration = _duration;
        refundTimestamp = block.timestamp + _duration;
    }

    receive() external payable {}

    function makeDonation() campaignEnded checkWithdrawal external payable {
        if (msg.value <= 0) revert InsufficientFunds();

        if (s_donors[msg.sender] == 0) {
            s_NumberOfDonors += 1;
            s_donorAddresses.push(msg.sender);
        }

        s_refundableAmounts[msg.sender] += msg.value;

        s_donors[msg.sender] += msg.value;
        s_AmountDonated += msg.value;
        emit FundsDonated(msg.sender, msg.value);
    }

    function createNewMilestone(string memory milestoneCID, uint256 votingPeriod) notOwner checkWithdrawal external {
        //check if we have a pending milestone or no milestone at all
        if (s_milestones[s_MilestoneCounter].status == MilestoneStatus.Pending) {
            revert MilestonePending();
        }
        //create a new milestone increment the milestonecounter
        s_MilestoneCounter++;
        //voting period for a minimum of 2 weeks before the proposal fails or passes
        Milestone storage newmilestone = s_milestones[s_MilestoneCounter];
        newmilestone.milestoneCID = milestoneCID;
        newmilestone.approved = false;
        newmilestone.votingPeriod = votingPeriod;
        newmilestone.status = MilestoneStatus.Pending;
        emit MilestoneCreated(msg.sender, votingPeriod);
    }

    function voteOnMilestone(bool vote) external {
        Milestone storage currentMilestone = s_milestones[s_MilestoneCounter];
        // Check if the milestone is pending which means we can vote
        if (currentMilestone.status != MilestoneStatus.Pending) {
            revert MilestoneNotPending();
        }
        if (s_donors[msg.sender] == 0) {
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
        emit MilestoneVoted(s_MilestoneCounter, msg.sender, vote);
    }

    function withdrawMilestone() notOwner external {
        Milestone storage currentMilestone = s_milestones[s_MilestoneCounter];
        if (block.timestamp <= currentMilestone.votingPeriod) {
            revert VotingStillOn();
        }
        if (currentMilestone.status != MilestoneStatus.Pending) {
            revert MilestoneNotPending();
        }
        if (block.timestamp < refundTimestamp) revert FundingPeriodStillOn();

        (uint yesVotes, uint256 noVotes) = _calculateTheVote(currentMilestone.votes);
        uint256 totalYesVotes = (s_NumberOfDonors - noVotes) * BASE_NUMBER;
        uint256 twoThirdsTotal = (2 * s_NumberOfDonors * BASE_NUMBER) / 3;

        if (totalYesVotes >= twoThirdsTotal) {
            currentMilestone.approved = true;
            s_NumberOfWithdrawal++;
            currentMilestone.status = MilestoneStatus.Approved;

            uint256 contractBalance = address(this).balance;
            if (contractBalance == 0) {
                revert InsufficientFunds();
            }

            uint256 amountToWithdraw;
            if (s_NumberOfWithdrawal == 1) {
                amountToWithdraw = contractBalance / 3;
            } else if (s_NumberOfWithdrawal == 2) {
                amountToWithdraw = contractBalance / 2;
            } else {
                amountToWithdraw = contractBalance;
                s_CampaignEnded = true;
            }

            (bool success, ) = s_CampaignOwner.call{ value: amountToWithdraw }("");
            if (!success) {
                revert WithdrawalFailed();
            }
            emit FundsWithdrawn(s_CampaignOwner, amountToWithdraw);
        } else {
            currentMilestone.status = MilestoneStatus.Declined;
            emit MilestoneRejected(yesVotes, noVotes);
        }
    }

    function performUpkeep(bytes calldata /* performData */) campaignEnded external {
        if (block.timestamp < refundTimestamp) revert RefundDeclined();
        if (s_AmountDonated >= s_FundingGoal) revert FundingGoalReached();
        if (s_refundInitiated) revert RefundAlreadyInitiated();

        s_refundInitiated = true;
        emit RefundInitiated();
        uint256 donorsLength = s_donorAddresses.length;
        for (uint256 counter = 0; counter < donorsLength; ++counter) {
            address donor = s_donorAddresses[counter];
            if (!s_refundClaimed[donor]) {
                s_refundClaimed[donor] = true;
                uint256 refundAmount = s_refundableAmounts[donor];
                s_refundableAmounts[donor] = 0;
                (bool success, ) = donor.call{ value: refundAmount }("");
                if (success) {
                    s_CampaignEnded = true;
                }
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
    
    function getCampaignInfo() external view returns (address, uint256, uint256, string memory, uint256, uint256, Milestone memory, bool, uint32, uint256) {
        return (s_CampaignOwner, s_CampaignDuration, s_FundingGoal, s_FundingCId, s_NumberOfDonors, s_AmountDonated, s_milestones[s_MilestoneCounter], s_CampaignEnded, s_NumberOfWithdrawal, address(this).balance);
    }
}
