namespace HhCrowdFunding.Contracts.CrowdFundingContract

open System
open System.Threading.Tasks
open System.Collections.Generic
open System.Numerics
open Nethereum.Hex.HexTypes
open Nethereum.ABI.FunctionEncoding.Attributes
open Nethereum.Web3
open Nethereum.RPC.Eth.DTOs
open Nethereum.Contracts.CQS
open Nethereum.Contracts.ContractHandlers
open Nethereum.Contracts
open System.Threading
open HhCrowdFunding.Contracts.CrowdFundingContract.ContractDefinition


    type CrowdFundingContractService (web3: Web3, contractAddress: string) =
    
        member val Web3 = web3 with get
        member val ContractHandler = web3.Eth.GetContractHandler(contractAddress) with get
    
        static member DeployContractAndWaitForReceiptAsync(web3: Web3, crowdFundingContractDeployment: CrowdFundingContractDeployment, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> = 
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            web3.Eth.GetContractDeploymentHandler<CrowdFundingContractDeployment>().SendRequestAndWaitForReceiptAsync(crowdFundingContractDeployment, cancellationTokenSourceVal)
        
        static member DeployContractAsync(web3: Web3, crowdFundingContractDeployment: CrowdFundingContractDeployment): Task<string> =
            web3.Eth.GetContractDeploymentHandler<CrowdFundingContractDeployment>().SendRequestAsync(crowdFundingContractDeployment)
        
        static member DeployContractAndGetServiceAsync(web3: Web3, crowdFundingContractDeployment: CrowdFundingContractDeployment, ?cancellationTokenSource : CancellationTokenSource) = async {
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            let! receipt = CrowdFundingContractService.DeployContractAndWaitForReceiptAsync(web3, crowdFundingContractDeployment, cancellationTokenSourceVal) |> Async.AwaitTask
            return new CrowdFundingContractService(web3, receipt.ContractAddress);
            }
    
        member this.CampaignOwnerQueryAsync(campaignOwnerFunction: CampaignOwnerFunction, ?blockParameter: BlockParameter): Task<string> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<CampaignOwnerFunction, string>(campaignOwnerFunction, blockParameterVal)
            
        member this.CreateNewMilestoneRequestAsync(createNewMilestoneFunction: CreateNewMilestoneFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(createNewMilestoneFunction);
        
        member this.CreateNewMilestoneRequestAndWaitForReceiptAsync(createNewMilestoneFunction: CreateNewMilestoneFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(createNewMilestoneFunction, cancellationTokenSourceVal);
        
        member this.DonorsQueryAsync(donorsFunction: DonorsFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<DonorsFunction, BigInteger>(donorsFunction, blockParameterVal)
            
        member this.EtherBalanceQueryAsync(etherBalanceFunction: EtherBalanceFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<EtherBalanceFunction, BigInteger>(etherBalanceFunction, blockParameterVal)
            
        member this.GetCampaignDurationQueryAsync(getCampaignDurationFunction: GetCampaignDurationFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<GetCampaignDurationFunction, BigInteger>(getCampaignDurationFunction, blockParameterVal)
            
        member this.GetCampaignEndedQueryAsync(getCampaignEndedFunction: GetCampaignEndedFunction, ?blockParameter: BlockParameter): Task<bool> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<GetCampaignEndedFunction, bool>(getCampaignEndedFunction, blockParameterVal)
            
        member this.GetDonationQueryAsync(getDonationFunction: GetDonationFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<GetDonationFunction, BigInteger>(getDonationFunction, blockParameterVal)
            
        member this.GetFundingCIdQueryAsync(getFundingCIdFunction: GetFundingCIdFunction, ?blockParameter: BlockParameter): Task<string> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<GetFundingCIdFunction, string>(getFundingCIdFunction, blockParameterVal)
            
        member this.GetTargetAmountQueryAsync(getTargetAmountFunction: GetTargetAmountFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<GetTargetAmountFunction, BigInteger>(getTargetAmountFunction, blockParameterVal)
            
        member this.InitializeRequestAsync(initializeFunction: InitializeFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(initializeFunction);
        
        member this.InitializeRequestAndWaitForReceiptAsync(initializeFunction: InitializeFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(initializeFunction, cancellationTokenSourceVal);
        
        member this.MakeDonationRequestAsync(makeDonationFunction: MakeDonationFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(makeDonationFunction);
        
        member this.MakeDonationRequestAndWaitForReceiptAsync(makeDonationFunction: MakeDonationFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(makeDonationFunction, cancellationTokenSourceVal);
        
        member this.MilestonesQueryAsync(milestonesFunction: MilestonesFunction, ?blockParameter: BlockParameter): Task<MilestonesOutputDTO> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryDeserializingToObjectAsync<MilestonesFunction, MilestonesOutputDTO>(milestonesFunction, blockParameterVal)
            
        member this.NumberOfDonorsQueryAsync(numberOfDonorsFunction: NumberOfDonorsFunction, ?blockParameter: BlockParameter): Task<BigInteger> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<NumberOfDonorsFunction, BigInteger>(numberOfDonorsFunction, blockParameterVal)
            
        member this.ShowCurrentMilestoneQueryAsync(showCurrentMilestoneFunction: ShowCurrentMilestoneFunction, ?blockParameter: BlockParameter): Task<ShowCurrentMilestoneOutputDTO> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryDeserializingToObjectAsync<ShowCurrentMilestoneFunction, ShowCurrentMilestoneOutputDTO>(showCurrentMilestoneFunction, blockParameterVal)
            
        member this.StatusQueryAsync(statusFunction: StatusFunction, ?blockParameter: BlockParameter): Task<byte> =
            let blockParameterVal = defaultArg blockParameter null
            this.ContractHandler.QueryAsync<StatusFunction, byte>(statusFunction, blockParameterVal)
            
        member this.VoteOnMilestoneRequestAsync(voteOnMilestoneFunction: VoteOnMilestoneFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(voteOnMilestoneFunction);
        
        member this.VoteOnMilestoneRequestAndWaitForReceiptAsync(voteOnMilestoneFunction: VoteOnMilestoneFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(voteOnMilestoneFunction, cancellationTokenSourceVal);
        
        member this.WithdrawMilestoneRequestAsync(withdrawMilestoneFunction: WithdrawMilestoneFunction): Task<string> =
            this.ContractHandler.SendRequestAsync(withdrawMilestoneFunction);
        
        member this.WithdrawMilestoneRequestAndWaitForReceiptAsync(withdrawMilestoneFunction: WithdrawMilestoneFunction, ?cancellationTokenSource : CancellationTokenSource): Task<TransactionReceipt> =
            let cancellationTokenSourceVal = defaultArg cancellationTokenSource null
            this.ContractHandler.SendRequestAndWaitForReceiptAsync(withdrawMilestoneFunction, cancellationTokenSourceVal);
        
    

