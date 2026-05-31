const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const ReferralCode = require('../models/ReferralCode');
const { generateUniquePaymentAddress } = require('../services/cryptoService');
const { notifyAdmin, notifyParrain } = require('../services/telegramService');
const axios = require('axios');

// POST /payment/init - Démarrer une transaction
router.post('/init', async (req, res) => {
    try {
        const { pack, wallet, payment_method, referral_code } = req.body;

        // 1. Validation des données de base
        const [usdAmount, tokenAmount] = pack.split('|').map(Number);
        if (!usdAmount || !tokenAmount || !wallet || !payment_method) {
            return res.status(400).json({ msg: 'Données invalides.' });
        }

        // 2. Vérification du code de parrainage
        let finalUsdtToReceive = tokenAmount;
        let referralInfo = null;

        if (referral_code) {
            referralInfo = await ReferralCode.findOne({ code: referral_code.toUpperCase(), is_active: true });
            if (referralInfo) {
                const discount = referralInfo.discount_percent;
                finalUsdtToReceive = tokenAmount * (1 + discount / 100);
            }
        }

        // 3. Génération de l'adresse unique et du timer
        const userIndex = Date.now(); // Utiliser un timestamp comme index simple pour l'instant
        console.log(`Generating address for method: ${payment_method} with index: ${userIndex}`);
        const { address: uniquePaymentAddress } = generateUniquePaymentAddress(payment_method, userIndex);
        
        const expiryTime = new Date(Date.now() + (payment_method === 'CARD' ? 5400000 : 2700000)); // 90 min pour CARD, 45 min pour les autres

        // 4. Création de la transaction en base de données
        const newTransaction = new Transaction({
            user_wallet_address: wallet,
            payment_method,
            usd_amount: usdAmount,
            final_usdt_to_receive: finalUsdtToReceive,
            unique_payment_address: uniquePaymentAddress,
            expiry_time: expiryTime,
            referral_code_used: referralInfo ? referralInfo.code : null,
            parrain_name: referralInfo ? referralInfo.parrain_name : null,
            parrain_telegram_id: referralInfo ? referralInfo.parrain_telegram_id : null,
        });

        const savedTransaction = await newTransaction.save();

        // 5. Calcul du montant en crypto à envoyer
        let cryptoAmount = '';
        try {
            if (['BTC', 'ETH', 'SOL'].includes(payment_method)) {
                const prices = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
                const priceData = prices.data;

                if (payment_method === 'BTC') cryptoAmount = (usdAmount / priceData.bitcoin.usd).toFixed(8) + ' BTC';
                if (payment_method === 'ETH') cryptoAmount = (usdAmount / priceData.ethereum.usd).toFixed(6) + ' ETH';
                if (payment_method === 'SOL') cryptoAmount = (usdAmount / priceData.solana.usd).toFixed(6) + ' SOL';
            } else if (payment_method.includes('USDT')) {
                cryptoAmount = usdAmount + ' USDT';
            } else { // CARD
                cryptoAmount = '$' + usdAmount;
            }
        } catch (e) {
            cryptoAmount = 'Price unavailable';
        }

        // 6. Renvoi des informations au frontend
        res.json({
            unique_payment_address: uniquePaymentAddress,
            crypto_amount: cryptoAmount,
            final_usdt_to_receive: finalUsdtToReceive,
            expiry_time: expiryTime
        });

    } catch (err) {
        console.error('Erreur lors de l\'initialisation du paiement:', err.message);
        // Renvoyer une erreur JSON propre pour éviter le "SyntaxError" sur le frontend
        res.status(500).json({ msg: 'Erreur serveur lors de l\'initialisation du paiement.' });
    }
});

// GET /payment/check?wallet=...&method=... - Vérifier si une transaction est en cours
router.get('/check', async (req, res) => {
    try {
        const { wallet, method } = req.query;
        const transaction = await Transaction.findOne({
            user_wallet_address: wallet,
            payment_method: method,
            status: 'pending'
        });

        if (!transaction || transaction.expiry_time < new Date()) {
            return res.status(404).json({ msg: 'not_found' });
        }

        const timeLeft = Math.floor((transaction.expiry_time - new Date()) / 1000);
        res.json({
            unique_payment_address: transaction.unique_payment_address,
            time_left_seconds: timeLeft
        });

    } catch (err) {
        console.error('Erreur lors de la vérification du paiement:', err.message);
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
});

// TODO: Ajouter une route POST /payment/confirm qui sera appelée par le worker de surveillance blockchain
// pour confirmer un paiement, déclencher l'envoi de USDT et les notifications Telegram.

module.exports = router;
