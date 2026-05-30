const express = require('express');
const router = express.Router();
const ReferralCode = require('../models/ReferralCode');

// TODO: Ajouter un vrai système d'authentification (ex: avec une clé API dans les headers)
// Pour l'instant, c'est ouvert, mais il faut sécuriser ça en production !

// POST /admin/referral-codes - Créer un nouveau code de parrainage
router.post('/referral-codes', async (req, res) => {
    try {
        const { code, parrain_name, parrain_telegram_id, discount_percent } = req.body;

        if (!code || !parrain_name || !parrain_telegram_id || discount_percent === undefined) {
            return res.status(400).json({ msg: 'Tous les champs sont requis.' });
        }

        const newCode = new ReferralCode({
            code,
            parrain_name,
            parrain_telegram_id,
            discount_percent
        });

        const savedCode = await newCode.save();
        res.status(201).json(savedCode);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// GET /admin/referral-codes - Lister tous les codes de parrainage
router.get('/referral-codes', async (req, res) => {
    try {
        const codes = await ReferralCode.find();
        res.json(codes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;