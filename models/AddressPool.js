const mongoose = require('mongoose');

const AddressPoolSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    payment_method: {
        type: String,
        required: true, // 'BTC', 'ETH', 'SOL', etc.
    },
    is_available: {
        type: Boolean,
        default: true
    },
    locked_until: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('AddressPool', AddressPoolSchema);
