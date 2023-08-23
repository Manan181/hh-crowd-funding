require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');
require('dotenv').config();

const COMPILER_SETTINGS = {
    optimizer: {
        enabled: true,
        runs: 10000,
    },
    metadata: {
        bytecodeHash: 'none',
    },
};

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const MNEMONIC = process.env.MNEMONIC;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const REPORT_GAS = process.env.REPORT_GAS;

module.exports = {
    defaultNetwork: 'ganache',
    solidity: {
        compilers: [
            {
                version: "0.8.19",
                COMPILER_SETTINGS
            }
        ],
    },
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        localhost: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL !== undefined ? SEPOLIA_RPC_URL : '',
            accounts: {
                mnemonic: MNEMONIC,
            },
            chainId: 11155111,
        },
        ganache: {
            url: GANACHE_RPC_URL !== undefined ? GANACHE_RPC_URL : '',
            chainId: 1337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: 'USD',
        outputFile: 'gas-report.txt',
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './build/cache',
        artifacts: './build/artifacts',
    },
    mocha: {
        timeout: 300000, // 300 seconds max for running tests
    },
};
