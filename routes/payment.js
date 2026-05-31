const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
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

        // 2. Vérification du code de parrainage (depuis les variables d'environnement)
        let finalUsdtToReceive = tokenAmount;
        let referralInfo = null;

        if (referral_code) {
            try {
                // On lit la liste des codes depuis la variable d'environnement
                const referralCodesJson = process.env.REFERRAL_CODES;
                const referralCodes = JSON.parse(referralCodesJson);
                referralInfo = referralCodes.find(c => c.code.toUpperCase() === referral_code.toUpperCase());

                if (referralInfo) {
                    const discount = referralInfo.discount_percent;
                    finalUsdtToReceive = tokenAmount * (1 + discount / 100);
                }
            } catch (e) {
                console.error('Erreur lecture des codes de parrainage:', e.message);
                // Si la variable d'environnement est mal formatée, on continue sans le code.
            }
        }

        // 3. Génération de l'adresse unique
        console.log(`Generating address for method: ${payment_method}`);
        const uniquePaymentAddress = await generateUniquePaymentAddress(paymentMethod);
        
        // 4. Timer (90 min pour CARD, 45 min pour crypto)
        const expiryTime = new Date(Date.now() + (payment_method === 'CARD' ? 5400000 : 2700000));

        // 5. Création de la transaction en base de données
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

        await newTransaction.save();

        // 6. Calcul du montant en crypto
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

        // 7. Notifications Telegram
        if (referralInfo) {
            await notifyParrain(referralInfo.parrain_telegram_id, wallet, finalUsdtToReceive);
        }
        await notifyAdmin(wallet, payment_method, finalUsdtToReceive, referralInfo ? referralInfo.parrain_name : 'Aucun');

        // 8. Renvoi des informations au frontend
        res.json({
            unique_payment_address: uniquePaymentAddress,
            crypto_amount: cryptoAmount,
            final_usdt_to_receive: finalUsdtToReceive,
            expiry_time: expiryTime
        });

    } catch (err) {
        console.error('Erreur lors de l\'initialisation du paiement:', err.message);
        res.status(500).json({ msg: 'Erreur serveur lors de l\'initialisation du paiement.' });
    }
});

// GET /payment/check
router.get('/check', async (req, res) => {
    try {
        const { wallet, method } = req.query;
        const transaction = await Transaction.findOne({ user_wallet_address: wallet, payment_method: method, status: 'pending' });
        if (!transaction || transaction.expiry_time < new Date()) {
            return res.status(404).json({ msg: 'not_found' });
        }
        const timeLeft = Math.floor((transaction.expiry_time - new Date()) / 1000);
        res.json({ unique_payment_address: transaction.unique_payment_address, time_left_seconds: timeLeft });
    } catch (err) {
        console.error('Erreur lors de la vérification du paiement:', err.message);
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
});

module.exports = router;
