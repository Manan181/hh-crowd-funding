const { network } = require("hardhat");
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;

    log("----------------------------------------------------");
    log("Deploying CrowdFundingContract...");
    const crowdFundingContract = await deploy("CrowdFundingContract", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying CrowdFundingContract...");
        await verify(crowdFund.address, arguments);
    }

    log("----------------------------------------------------");
    log("Deploying CrowdSourcingFactory...");
    const crowdSourcingFactory = await deploy("CrowdSourcingFactory", {
        from: deployer,
        args: [crowdFundingContract.address],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying CrowdFundingContract...");
        await verify(crowdSourcingFactory.address, arguments);
    }
}