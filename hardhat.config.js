require("@nomicfoundation/hardhat-toolbox");
require("hardhat/deploy");
require("dotenv").config();

const COMPILER_SETTINGS = {
    optimizer: {
        enabled: true,
        runs: 1000000,
    },
    metadata: {
        bytecodeHash: "none",
    },
};

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const MNEMONIC = process.env.MNEMONIC || "Your mnemonic";

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key";
const REPORT_GAS = process.env.REPORT_GAS || false;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "ganache",
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                COMPILER_SETTINGS,
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL !== undefined ? SEPOLIA_RPC_URL : "",
            accounts: {
                mnemonic: MNEMONIC,
            },
            chainId: 11155111,
        },
        ganache: {
            url: "http://127.0.0.1:7545",
            chainId: 1337,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./build/cache",
        artifacts: "./build/artifacts",
    },
    mocha: {
        timeout: 300000, // 300 seconds max for running tests
    },
};
