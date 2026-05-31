const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse Bitcoin (UNIQUE AVEC TIMESTAMP) ---
function generateBtcAddress() {
    const masterKeyWIF = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
    const masterNode = bitcoin.HDNode.fromWIF(masterKeyWIF);
    // On utilise un timestamp pour garantir une adresse unique à chaque appel
    const timestampIndex = Date.now();
    const childNode = masterNode.derivePath(`m/44'/0'/0'/0/${timestampIndex}`);
    return { address: childNode.getAddress() };
}

// --- Génération d'adresse Ethereum (UNIQUE AVEC TIMESTAMP) ---
function generateEthAddress() {
    const masterPrivateKey = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
    const masterNode = ethers.HDNodeWallet.fromSeed(masterPrivateKey);
    const timestampIndex = Date.now();
    const childNode = masterNode.derivePath(`m/44'/60'/0'/0/${timestampIndex}`);
    return { address: childNode.address };
}

// --- Génération d'adresse Solana (UNIQUE AVEC TIMESTAMP) ---
function generateSolAddress() {
    // Ta clé est une clé privée complète. On la convertit.
    const privateKeyBytes = Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'hex'));
    const masterKeypair = Keypair.fromSecretKey(privateKeyBytes);
    // On génère une nouvelle clé pair complètement aléatoire pour chaque transaction
    const newKeypair = Keypair.generate();
    return { address: newKeypair.publicKey.toString() };
}

// --- Génération d'adresse Tron (UNIQUE AVEC TIMESTAMP) ---
function generateTrxAddress() {
    const masterPrivateKey = process.env.MASTER_TRX_WALLET_PRIVATE_KEY;
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: masterPrivateKey
    });
    // Génère un nouveau compte Tron aléatoire pour chaque transaction
    const newAccount = tronWeb.utils.generateAccount();
    return { address: newAccount.address };
}

// --- Fonction principale ---
function generateUniquePaymentAddress(paymentMethod) {
    // On n'a plus besoin du userIndex, on génère une adresse unique à chaque fois
    switch (paymentMethod) {
        case 'BTC':
            return generateBtcAddress();
        case 'ETH':
        case 'USDT ERC20':
            return generateEthAddress();
        case 'SOL':
            return generateSolAddress();
        case 'USDT TRC20':
            return generateTrxAddress();
        default:
            throw new Error('Unsupported payment method');
    }
}

module.exports = {
    generateUniquePaymentAddress
};
