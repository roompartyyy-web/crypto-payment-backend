const { lockAvailableAddress } = require('./addressPoolService');

async function generateUniquePaymentAddress(paymentMethod) {
    const lockDuration = (paymentMethod === 'CARD') ? 90 : 45;
    return await lockAvailableAddress(paymentMethod, lockDuration);
}

module.exports = {
    generateUniquePaymentAddress
};
