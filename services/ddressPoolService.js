const AddressPool = require('../models/AddressPool');

// Trouve et verrouille une adresse disponible
async function lockAvailableAddress(paymentMethod, lockDurationMinutes) {
    const lockUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
    
    const address = await AddressPool.findOneAndUpdate(
        { 
            payment_method: paymentMethod, 
            $or: [
                { is_available: true },
                { locked_until: { $lte: new Date() } }
            ]
        },
        { 
            is_available: false, 
            locked_until: lockUntil 
        },
        { new: true, sort: { locked_until: 1 } }
    );

    if (!address) {
        throw new Error(`Aucune adresse disponible pour ${paymentMethod}`);
    }
    return address.address;
}

module.exports = {
    lockAvailableAddress
};
