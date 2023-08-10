namespace HhCrowdFunding.Contracts.CrowdFundingContract.ContractDefinition

open System
open System.Threading.Tasks
open System.Collections.Generic
open System.Numerics
open Nethereum.Hex.HexTypes
open Nethereum.ABI.FunctionEncoding.Attributes

    type Milestone() =
            [<Parameter("string", "milestoneCID", 1)>]
            member val public MilestoneCID = Unchecked.defaultof<string> with get, set
            [<Parameter("bool", "approved", 2)>]
            member val public Approved = Unchecked.defaultof<bool> with get, set
            [<Parameter("uint256", "votingPeriod", 3)>]
            member val public VotingPeriod = Unchecked.defaultof<BigInteger> with get, set
            [<Parameter("uint8", "status", 4)>]
            member val public Status = Unchecked.defaultof<byte> with get, set
            [<Parameter("tuple[]", "votes", 5)>]
            member val public Votes = Unchecked.defaultof<List<MilestoneVote>> with get, set
    

