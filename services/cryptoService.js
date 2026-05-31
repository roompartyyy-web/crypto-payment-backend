const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// Fonction pour générer une adresse Bitcoin depuis une clé privée WIF
function generateBtcAddress(wif) {
    const keyPair = bitcoin.ECPair.fromWIF(wif);
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    return { address };
}

// Fonction pour générer une adresse Ethereum depuis une clé privée
function generateEthAddress(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return { address: wallet.address };
}

// Fonction pour générer une adresse Solana depuis une clé privée
function generateSolAddress(privateKeyString) {
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKeyString)));
    return { address: keypair.publicKey.toString() };
}

// Fonction pour générer une adresse Tron depuis une clé privée
function generateTrxAddress(privateKey) {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: privateKey
    });
    return { address: tronWeb.defaultAddress.base58 };
}

// --- Fonction principale qui choisit la bonne génération ---
function generateUniquePaymentAddress(paymentMethod) {
    switch (paymentMethod) {
        case 'BTC':
            return generateBtcAddress(process.env.MASTER_BTC_WALLET_PRIVATE_KEY);
        case 'ETH':
        case 'USDT ERC20':
            return generateEthAddress(process.env.MASTER_ETH_WALLET_PRIVATE_KEY);
        case 'SOL':
            return generateSolAddress(process.env.MASTER_SOL_WALLET_PRIVATE_KEY);
        case 'USDT TRC20':
            return generateTrxAddress(process.env.MASTER_TRX_WALLET_PRIVATE_KEY);
        default:
            throw new Error('Unsupported payment method');
    }
}

module.exports = {
    generateUniquePaymentAddress
};
