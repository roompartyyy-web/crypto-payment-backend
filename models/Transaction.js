const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user_wallet_address: {
        type: String,
        required: true,
        trim: true
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['BTC', 'ETH', 'SOL', 'USDT ERC20', 'USDT TRC20', 'CARD']
    },
    usd_amount: {
        type: Number,
        required: true
    },
    final_usdt_to_receive: {
        type: Number,
        required: true
    },
    unique_payment_address: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'expired', 'failed'],
        default: 'pending'
    },
    expiry_time: {
        type: Date,
        required: true
    },
    referral_code_used: {
        type: String,
        default: null
    },
    parrain_name: {
        type: String,
        default: null
    },
    // NOUVEAU : On stocke aussi l'ID Telegram du parrain pour la notification
    parrain_telegram_id: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('transaction', TransactionSchema);