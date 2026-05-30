const mongoose = require('mongoose');

const ReferralCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    discount_percent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    parrain_name: {
        type: String,
        required: true
    },
    parrain_telegram_id: {
        type: String,
        required: true,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('referral_code', ReferralCodeSchema);
