const express = require('express');
const router = express.Router();
const ReferralCode = require('../models/ReferralCode');

// POST /admin/referral-codes - Créer un nouveau code de parrainage
router.post('/referral-codes', async (req, res) => {
    try {
        const { code, parrain_name, parrain_telegram_id, discount_percent } = req.body;
        const newCode = new ReferralCode({ code, parrain_name, parrain_telegram_id, discount_percent });
        await newCode.save();
        res.status(201).json(newCode);
    } catch (err) {
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// GET /admin/referral-codes - Lister tous les codes
router.get('/referral-codes', async (req, res) => {
    try {
        const codes = await ReferralCode.find({});
        res.json(codes);
    } catch (err) {
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

module.exports = router;
