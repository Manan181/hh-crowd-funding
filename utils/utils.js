const { ethers } = require("hardhat");

module.exports = {
    getLatestBlockTimeStamp: async () => {
        try {
            const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
            return timeStamp;
        } catch (error) {
            return error;
        }
    },

    convertToEther: (amount) => {
        try {
            const ether = ethers.utils.formatEther(amount);
            return ether.toString();
        } catch (error) {
            return error;
        }
    },

    convertToWei: (amount) => {
        try {
            const wei = ethers.utils.parseEther(amount);
            return wei.toString();
        } catch (error) {
            return error;
        }
    },

    getSigners: async () => {
        const [owner, otherAccount, someOtherAccount, accountOne, accountTwo, accountThree, accountFour] = await ethers.getSigners();
        return { owner, otherAccount, someOtherAccount, accountOne, accountTwo, accountThree, accountFour };
    },

    getProvider: () => {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
        return provider;
    },
}
