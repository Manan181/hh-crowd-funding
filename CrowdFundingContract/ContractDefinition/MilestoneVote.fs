namespace HhCrowdFunding.Contracts.CrowdFundingContract.ContractDefinition

open System
open System.Threading.Tasks
open System.Collections.Generic
open System.Numerics
open Nethereum.Hex.HexTypes
open Nethereum.ABI.FunctionEncoding.Attributes

    type MilestoneVote() =
            [<Parameter("address", "donorAddress", 1)>]
            member val public DonorAddress = Unchecked.defaultof<string> with get, set
            [<Parameter("bool", "vote", 2)>]
            member val public Vote = Unchecked.defaultof<bool> with get, set
    

