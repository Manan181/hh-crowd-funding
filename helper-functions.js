const stripHexPrefix = (hex) => {
    if (!ethers.utils.isHexString(hex)) {
        throw Error(`Expected valid hex string, got: "${hex}"`);
    }

    return hex.replace('0x', '');
};

const addHexPrefix = (hex) => {
    return hex.startsWith('0x') ? hex : `0x${hex}`;
};

const numToBytes32 = (num) => {
    const hexNum = ethers.utils.hexlify(num);
    const strippedNum = stripHexPrefix(hexNum);
    if (strippedNum.length > 32 * 2) {
        throw Error('Cannot convert number to bytes32 format, value is greater than maximum bytes32 value');
    }
    return addHexPrefix(strippedNum.padStart(32 * 2, '0'));
};

module.exports = {
    verify,
    numToBytes32,
};
