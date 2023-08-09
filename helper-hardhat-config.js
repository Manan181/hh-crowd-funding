const networkConfig = {
    default: {
        name: 'hardhat',
        fee: '100000000000000000',
        fundAmount: '1000000000000000000',
        automationUpdateInterval: '30',
    },
    31337: {
        name: 'localhost',
        fee: '100000000000000000',
        fundAmount: '1000000000000000000',
        automationUpdateInterval: '30',
    },
    1337: {
        name: 'ganache',
        fee: '100000000000000000',
        fundAmount: '1000000000000000000',
        automationUpdateInterval: '30',
    },
    11155111: {
        name: 'sepolia',
        fee: '100000000000000000',
        fundAmount: '100000000000000000', // 0.1
        automationUpdateInterval: '30',
    },
};

const developmentChains = ['hardhat', 'localhost', 'ganache'];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
};
