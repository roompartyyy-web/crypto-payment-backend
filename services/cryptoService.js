const { ethers } = require('ethers');
const { Keypair } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse Bitcoin ---
function generateBtcAddress() {
    try {
        // On importe la librairie à l'intérieur pour éviter les erreurs au démarrage
        const bitcoin = require('bitcoinjs-lib');
        const keyPair = bitcoin.ECPair.fromWIF(process.env.MASTER_BTC_WALLET_PRIVATE_KEY);
        return { address: bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address };
    } catch (e) {
        console.error("Erreur génération BTC:", e.message);
        throw new Error('La génération d\'adresse BTC a échoué.');
    }
}

// --- Génération d'adresse Ethereum ---
function generateEthAddress() {
    try {
        return { address: new ethers.Wallet(process.env.MASTER_ETH_WALLET_PRIVATE_KEY).address };
    } catch (e) {
        console.error("Erreur génération ETH:", e.message);
        throw new Error('La génération d\'adresse ETH a échoué.');
    }
}

// --- Génération d'adresse Solana ---
function generateSolAddress() {
    try {
        const privateKeyBytes = Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'hex'));
        const keypair = Keypair.fromSecretKey(privateKeyBytes);
        return { address: keypair.publicKey.toString() };
    } catch (e) {
        console.error("Erreur génération SOL:", e.message);
        throw new Error('La génération d\'adresse SOL a échoué.');
    }
}

// --- Génération d'adresse Tron ---
function generateTrxAddress() {
    try {
        const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
        const account = tronWeb.utils.address.generateAddress(); // Méthode plus directe
        return { address: account };
    } catch (e) {
        console.error("Erreur génération TRX:", e.message);
        throw new Error('La génération d\'adresse TRX a échoué.');
    }
}

// --- Fonction principale ---
function generateUniquePaymentAddress(paymentMethod) {
    switch (paymentMethod) {
        case 'BTC': return generateBtcAddress();
        case 'ETH':
        case 'USDT ERC20': return generateEthAddress();
        case 'SOL': return generateSolAddress();
        case 'USDT TRC20': return generateTrxAddress();
        case 'CARD': return generateSolAddress(); // Pour CARD, on utilise l'adresse Solana pour la logique d'envoi
        default: throw new Error('Méthode de paiement non supportée.');
    }
}

module.exports = {
    generateUniquePaymentAddress
};
