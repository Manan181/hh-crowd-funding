namespace HhCrowdFunding.Contracts.CrowdFundingContract.ContractDefinition

open System
open System.Threading.Tasks
open System.Collections.Generic
open System.Numerics
open Nethereum.Hex.HexTypes
open Nethereum.ABI.FunctionEncoding.Attributes
open Nethereum.RPC.Eth.DTOs
open Nethereum.Contracts.CQS
open Nethereum.Contracts
open System.Threading

    
    
    type CrowdFundingContractDeployment(byteCode: string) =
        inherit ContractDeploymentMessage(byteCode)
        
        static let BYTECODE = "608060405234801561001057600080fd5b506117c3806100206000396000f3fe6080604052600436106101025760003560e01c8063ad66e52a11610095578063bdfb496d11610064578063bdfb496d14610273578063bf2928a61461029c578063ca0cdea8146102b1578063e89e4ed6146102de578063f66a997b1461030e57600080fd5b8063ad66e52a146101e6578063b17fac22146101f9578063ba53619314610231578063bce9d2f81461025157600080fd5b80637bc25483116100d15780637bc254831461017c5780638e6924641461019157806391ac4b88146101b1578063977d08c0146101c657600080fd5b8063200d2ed21461010e57806340ea0a941461013e5780634bf717291461014857806364b2e2d91461016757600080fd5b3661010957005b600080fd5b34801561011a57600080fd5b506009546101289060ff1681565b60405161013591906111b8565b60405180910390f35b610146610330565b005b34801561015457600080fd5b506004545b604051908152602001610135565b34801561017357600080fd5b50600554610159565b34801561018857600080fd5b50600354610159565b34801561019d57600080fd5b506101466101ac3660046111e2565b6104c1565b3480156101bd57600080fd5b50600254610159565b3480156101d257600080fd5b506101466101e1366004611297565b61069c565b3480156101f257600080fd5b5047610159565b34801561020557600080fd5b50600054630100000090046001600160a01b03166040516001600160a01b039091168152602001610135565b34801561023d57600080fd5b5061014661024c366004611316565b6107dd565b34801561025d57600080fd5b506102666109d8565b6040516101359190611385565b34801561027f57600080fd5b5060005462010000900460ff166040519015158152602001610135565b3480156102a857600080fd5b50610146610a6a565b3480156102bd57600080fd5b506101596102cc366004611398565b600a6020526000908152604090205481565b3480156102ea57600080fd5b506102fe6102f93660046113c1565b610e89565b60405161013594939291906113da565b34801561031a57600080fd5b50610323610f40565b6040516101359190611413565b600054349062010000900460ff16156103815760405162461bcd60e51b815260206004820152600e60248201526d18d85b5c185a59db88195b99195960921b60448201526064015b60405180910390fd5b600081116103c65760405162461bcd60e51b8152602060048201526012602482015271596f7520646964206e6f7420646f6e61746560701b6044820152606401610378565b6008546003036104185760405162461bcd60e51b815260206004820152601960248201527f6e6f206c6f6e6765722074616b696e6720646f6e6174696f6e000000000000006044820152606401610378565b336000908152600a602052604081205490036104475760016005600082825461044191906114d3565b90915550505b336000908152600a6020526040812080548392906104669084906114d3565b92505081905550806004600082825461047f91906114d3565b90915550506040805182815242602082015233917f7be992b019ae2b814cc7e81328fd30f2a7d6f6602ab4aa03a40a86707b46de81910160405180910390a250565b600054630100000090046001600160a01b031633146105165760405162461bcd60e51b81526020600482015260116024820152703cb7ba903737ba103a34329037bbb732b960791b6044820152606401610378565b600260065463ffffffff166000908152600b602052604090206003015460ff16600281111561054757610547611180565b036105945760405162461bcd60e51b815260206004820152601c60248201527f796f75206861766520612070656e64696e67206d696c6573746f6e65000000006044820152606401610378565b6008546003036105e65760405162461bcd60e51b815260206004820152601b60248201527f6e6f206d6f7265206d696c6573746f6e6520746f2063726561746500000000006044820152606401610378565b6006805463ffffffff169060006105fc836114e6565b82546101009290920a63ffffffff818102199093169183160217909155600654166000908152600b602052604090209050806106388482611592565b5060018101805460ff199081169091556002808301849055600383018054909216179055604080514281526020810184905233917f2ecc66d65b53b31126aca935e4c618d759ff977be4b1b66e74173de72c43d70f910160405180910390a2505050565b600054610100900460ff16158080156106bc5750600054600160ff909116105b806106d65750303b1580156106d6575060005460ff166001145b6107395760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610378565b6000805460ff19166001179055801561075c576000805461ff0019166101001790555b600080546301000000600160b81b031916326301000000021790556001610784858783611652565b506002839055600382905580156107d6576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498906020015b60405180910390a15b5050505050565b600260065463ffffffff166000908152600b602052604090206003015460ff16600281111561080e5761080e611180565b1461085b5760405162461bcd60e51b815260206004820152601960248201527f63616e206e6f7420766f7465206f6e206d696c6573746f6e65000000000000006044820152606401610378565b336000908152600a602052604081205490036108af5760405162461bcd60e51b81526020600482015260136024820152723cb7ba9030b932903737ba1030903237b737b960691b6044820152606401610378565b60065463ffffffff166000908152600b6020526040812060040154815b8183101561095d5760065463ffffffff166000908152600b6020526040812060040180548590811061090057610900611712565b6000918252602091829020604080518082019091529101546001600160a01b038116808352600160a01b90910460ff16151592820192909252915033900361094c57600191505061095d565b5061095683611728565b92506108cc565b806109d257604080518082018252338152851515602080830191825260065463ffffffff166000908152600b825293842060040180546001810182559085529320915191909201805492511515600160a01b026001600160a81b03199093166001600160a01b03909216919091179190911790555b50505050565b6060600180546109e790611509565b80601f0160208091040260200160405190810160405280929190818152602001828054610a1390611509565b8015610a605780601f10610a3557610100808354040283529160200191610a60565b820191906000526020600020905b815481529060010190602001808311610a4357829003601f168201915b5050505050905090565b600054630100000090046001600160a01b03163314610abf5760405162461bcd60e51b81526020600482015260116024820152703cb7ba903737ba103a34329037bbb732b960791b6044820152606401610378565b60065463ffffffff166000908152600b60205260409020600201544211610b1a5760405162461bcd60e51b815260206004820152600f60248201526e3b37ba34b7339039ba34b6361037b760891b6044820152606401610378565b600260065463ffffffff166000908152600b602052604090206003015460ff166002811115610b4b57610b4b611180565b14610b8a5760405162461bcd60e51b815260206004820152600f60248201526e1b5a5b195cdd1bdb9948195b991959608a1b6044820152606401610378565b60065463ffffffff166000908152600b6020908152604080832060040180548251818502810185019093528083528493610c1a93929190859084015b82821015610c1157600084815260209081902060408051808201909152908401546001600160a01b0381168252600160a01b900460ff16151581830152825260019092019101610bc6565b505050506110c6565b91509150600081600554610c2e9190611741565b905060006003670de0b6b3a76400006005546002610c4c9190611754565b610c569190611754565b610c60919061176b565b90506000610c76670de0b6b3a764000084611754565b9050818110610e2d5760065463ffffffff166000908152600b602052604081206001908101805460ff191690911790556008805491610cb483611728565b909155505060065463ffffffff166000908152600b60205260409020600301805460ff191690554780610d1f5760405162461bcd60e51b81526020600482015260136024820152726e6f7468696e6720746f20776974686472617760681b6044820152606401610378565b6000600854600103610d3d57610d3660038361176b565b9050610d66565b600854600203610d5257610d3660028361176b565b506000805462ff0000191662010000179055805b6000805460405163010000009091046001600160a01b0316906108fc84150290849084818181858888f19350505050905080610dd85760405162461bcd60e51b81526020600482015260116024820152701dda5d1a191c985dd85b0819985a5b1959607a1b6044820152606401610378565b6000546040805184815242602082015263010000009092046001600160a01b0316917ffbc3a599b784fe88772fc5abcc07223f64ca0b13acc341f4fb1e46bef0510eb4910160405180910390a25050506107d6565b60065463ffffffff166000908152600b6020908152604091829020600301805460ff1916600117905581518781529081018690527f4e2fd11f84344693b41d2aba9910e33b34a4f02d4d3a65b65b2201f3c8fa3c8991016107cd565b600b60205260009081526040902080548190610ea490611509565b80601f0160208091040260200160405190810160405280929190818152602001828054610ed090611509565b8015610f1d5780601f10610ef257610100808354040283529160200191610f1d565b820191906000526020600020905b815481529060010190602001808311610f0057829003601f168201915b5050505060018301546002840154600390940154929360ff918216939092501684565b610f4861113e565b60065463ffffffff166000908152600b602052604090819020815160a08101909252805482908290610f7990611509565b80601f0160208091040260200160405190810160405280929190818152602001828054610fa590611509565b8015610ff25780601f10610fc757610100808354040283529160200191610ff2565b820191906000526020600020905b815481529060010190602001808311610fd557829003601f168201915b5050509183525050600182015460ff90811615156020830152600280840154604084015260038401546060909301929091169081111561103457611034611180565b600281111561104557611045611180565b815260200160048201805480602002602001604051908101604052809291908181526020016000905b828210156110b957600084815260209081902060408051808201909152908401546001600160a01b0381168252600160a01b900460ff1615158183015282526001909201910161106e565b5050505081525050905090565b60008060008060008551905060005b81811015611132578681815181106110ef576110ef611712565b602002602001015160200151151560011515036111165761110f84611728565b9350611122565b61111f83611728565b92505b61112b81611728565b90506110d5565b50919590945092505050565b6040518060a0016040528060608152602001600015158152602001600081526020016000600281111561117357611173611180565b8152602001606081525090565b634e487b7160e01b600052602160045260246000fd5b600381106111b457634e487b7160e01b600052602160045260246000fd5b9052565b602081016111c68284611196565b92915050565b634e487b7160e01b600052604160045260246000fd5b600080604083850312156111f557600080fd5b823567ffffffffffffffff8082111561120d57600080fd5b818501915085601f83011261122157600080fd5b813581811115611233576112336111cc565b604051601f8201601f19908116603f0116810190838211818310171561125b5761125b6111cc565b8160405282815288602084870101111561127457600080fd5b826020860160208301376000602093820184015298969091013596505050505050565b600080600080606085870312156112ad57600080fd5b843567ffffffffffffffff808211156112c557600080fd5b818701915087601f8301126112d957600080fd5b8135818111156112e857600080fd5b8860208285010111156112fa57600080fd5b6020928301999098509187013596604001359550909350505050565b60006020828403121561132857600080fd5b8135801515811461133857600080fd5b9392505050565b6000815180845260005b8181101561136557602081850181015186830182015201611349565b506000602082860101526020601f19601f83011685010191505092915050565b602081526000611338602083018461133f565b6000602082840312156113aa57600080fd5b81356001600160a01b038116811461133857600080fd5b6000602082840312156113d357600080fd5b5035919050565b6080815260006113ed608083018761133f565b9050841515602083015283604083015261140a6060830184611196565b95945050505050565b60006020808352835160a08285015261142f60c085018261133f565b9050818501516040811515818701528087015160608701526060870151915061145b6080870183611196565b6080870151868403601f190160a0880152805180855290850193600093508501905b808410156114b157845180516001600160a01b0316835286015115158683015293850193600193909301929082019061147d565b50979650505050505050565b634e487b7160e01b600052601160045260246000fd5b808201808211156111c6576111c66114bd565b600063ffffffff8083168181036114ff576114ff6114bd565b6001019392505050565b600181811c9082168061151d57607f821691505b60208210810361153d57634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561158d57600081815260208120601f850160051c8101602086101561156a5750805b601f850160051c820191505b8181101561158957828155600101611576565b5050505b505050565b815167ffffffffffffffff8111156115ac576115ac6111cc565b6115c0816115ba8454611509565b84611543565b602080601f8311600181146115f557600084156115dd5750858301515b600019600386901b1c1916600185901b178555611589565b600085815260208120601f198616915b8281101561162457888601518255948401946001909101908401611605565b50858210156116425787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b67ffffffffffffffff83111561166a5761166a6111cc565b61167e836116788354611509565b83611543565b6000601f8411600181146116b2576000851561169a5750838201355b600019600387901b1c1916600186901b1783556107d6565b600083815260209020601f19861690835b828110156116e357868501358255602094850194600190920191016116c3565b50868210156117005760001960f88860031b161c19848701351681555b505060018560011b0183555050505050565b634e487b7160e01b600052603260045260246000fd5b60006001820161173a5761173a6114bd565b5060010190565b818103818111156111c6576111c66114bd565b80820281158282048414176111c6576111c66114bd565b60008261178857634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220fc894fe837e257278bdbe81d79bcebac8be28c638303a1d654319be09845e17564736f6c63430008130033"
        
        new() = CrowdFundingContractDeployment(BYTECODE)
        

        
    
    [<Function("campaignOwner", "address")>]
    type CampaignOwnerFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("createNewMilestone")>]
    type CreateNewMilestoneFunction() = 
        inherit FunctionMessage()
    
            [<Parameter("string", "milestoneCID", 1)>]
            member val public MilestoneCID = Unchecked.defaultof<string> with get, set
            [<Parameter("uint256", "votingPeriod", 2)>]
            member val public VotingPeriod = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Function("donors", "uint256")>]
    type DonorsFunction() = 
        inherit FunctionMessage()
    
            [<Parameter("address", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<string> with get, set
        
    
    [<Function("etherBalance", "uint256")>]
    type EtherBalanceFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("getCampaignDuration", "uint256")>]
    type GetCampaignDurationFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("getCampaignEnded", "bool")>]
    type GetCampaignEndedFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("getDonation", "uint256")>]
    type GetDonationFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("getFundingCId", "string")>]
    type GetFundingCIdFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("getTargetAmount", "uint256")>]
    type GetTargetAmountFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("initialize")>]
    type InitializeFunction() = 
        inherit FunctionMessage()
    
            [<Parameter("string", "_fundingCId", 1)>]
            member val public FundingCId = Unchecked.defaultof<string> with get, set
            [<Parameter("uint256", "_amount", 2)>]
            member val public Amount = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint256", "_duration", 3)>]
            member val public Duration = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Function("makeDonation")>]
    type MakeDonationFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("milestones", typeof<MilestonesOutputDTO>)>]
    type MilestonesFunction() = 
        inherit FunctionMessage()
    
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Function("numberOfDonors", "uint256")>]
    type NumberOfDonorsFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("showCurrentMilestone", typeof<ShowCurrentMilestoneOutputDTO>)>]
    type ShowCurrentMilestoneFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("status", "uint8")>]
    type StatusFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Function("voteOnMilestone")>]
    type VoteOnMilestoneFunction() = 
        inherit FunctionMessage()
    
            [<Parameter("bool", "vote", 1)>]
            member val public Vote = Unchecked.defaultof<bool> with get, set
        
    
    [<Function("withdrawMilestone")>]
    type WithdrawMilestoneFunction() = 
        inherit FunctionMessage()
    

        
    
    [<Event("FundsDonated")>]
    type FundsDonatedEventDTO() =
        inherit EventDTO()
            [<Parameter("address", "donor", 1, true )>]
            member val Donor = Unchecked.defaultof<string> with get, set
            [<Parameter("uint256", "amount", 2, false )>]
            member val Amount = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint256", "date", 3, false )>]
            member val Date = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Event("FundsWithdrawn")>]
    type FundsWithdrawnEventDTO() =
        inherit EventDTO()
            [<Parameter("address", "owner", 1, true )>]
            member val Owner = Unchecked.defaultof<string> with get, set
            [<Parameter("uint256", "amount", 2, false )>]
            member val Amount = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint256", "date", 3, false )>]
            member val Date = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Event("Initialized")>]
    type InitializedEventDTO() =
        inherit EventDTO()
            [<Parameter("uint8", "version", 1, false )>]
            member val Version = Unchecked.defaultof<byte> with get, set
        
    
    [<Event("MilestoneCreated")>]
    type MilestoneCreatedEventDTO() =
        inherit EventDTO()
            [<Parameter("address", "owner", 1, true )>]
            member val Owner = Unchecked.defaultof<string> with get, set
            [<Parameter("uint256", "datecreated", 2, false )>]
            member val Datecreated = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint256", "period", 3, false )>]
            member val Period = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<Event("MilestoneRejected")>]
    type MilestoneRejectedEventDTO() =
        inherit EventDTO()
            [<Parameter("uint256", "yesvote", 1, false )>]
            member val Yesvote = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint256", "novote", 2, false )>]
            member val Novote = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type CampaignOwnerOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("address", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<string> with get, set
        
    
    
    
    [<FunctionOutput>]
    type DonorsOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type EtherBalanceOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type GetCampaignDurationOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type GetCampaignEndedOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("bool", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<bool> with get, set
        
    
    [<FunctionOutput>]
    type GetDonationOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type GetFundingCIdOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("string", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<string> with get, set
        
    
    [<FunctionOutput>]
    type GetTargetAmountOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    
    
    
    
    [<FunctionOutput>]
    type MilestonesOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("string", "milestoneCID", 1)>]
            member val public MilestoneCID = Unchecked.defaultof<string> with get, set
            [<Parameter("bool", "approved", 2)>]
            member val public Approved = Unchecked.defaultof<bool> with get, set
            [<Parameter("uint256", "votingPeriod", 3)>]
            member val public VotingPeriod = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint8", "status", 4)>]
            member val public Status = Unchecked.defaultof<byte> with get, set
        
    
    [<FunctionOutput>]
    type NumberOfDonorsOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint256", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<BigInteger> with get, set
        
    
    [<FunctionOutput>]
    type ShowCurrentMilestoneOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("tuple", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<Milestone> with get, set
        
    
    [<FunctionOutput>]
    type StatusOutputDTO() =
        inherit FunctionOutputDTO() 
            [<Parameter("uint8", "", 1)>]
            member val public ReturnValue1 = Unchecked.defaultof<byte> with get, set
        
    
    
    


