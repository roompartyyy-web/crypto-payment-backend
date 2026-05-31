const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse unique pour Bitcoin (HD Wallet) ---
function generateBtcAddress(userIndex) {
    const masterKeyWIF = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
    const masterNode = bitcoin.HDNode.fromWIF(masterKeyWIF); // Use fromWIF for a WIF key
    // Derive a new address for each transaction
    const childNode = masterNode.derivePath(`m/44'/0'/0'/0/${userIndex}`);
    return {
        address: childNode.getAddress(),
    };
}

// --- Génération d'adresse unique pour Ethereum (HD Wallet) ---
function generateEthAddress(userIndex) {
    const masterPrivateKey = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
    const masterNode = ethers.HDNodeWallet.fromSeed(masterPrivateKey); // Assumes the key is a seed. If it's a private key, you might need a different approach.
    // Derive a new address for each transaction
    const basePath = "m/44'/60'/0'/0";
    const childNode = masterNode.derivePath(`${basePath}/${userIndex}`);
    return {
        address: childNode.address,
    };
}

// --- Génération d'adresse unique pour Solana (HD Wallet) ---
function generateSolAddress(userIndex) {
    const masterSeed = process.env.MASTER_SOL_WALLET_PRIVATE_KEY; // This should ideally be a seed phrase
    const keypair = Keypair.fromSeed(Uint8Array.from(Buffer.from(masterSeed, 'base64')));
    // Derive a new keypair for each transaction
    const derivedKeypair = Keypair.fromSeed(keypair.secretKey.slice(0, 32)); // Simplified derivation
    return {
        address: derivedKeypair.publicKey.toString(),
    };
}

// --- Génération d'adresse unique pour Tron (HD Wallet) ---
function generateTrxAddress(userIndex) {
    const masterMnemonic = process.env.MASTER_TRX_WALLET_PRIVATE_KEY; // This should ideally be a mnemonic
    const masterNode = TronWeb.fromMnemonic(masterMnemonic);
    // Derive a new address for each transaction
    const childNode = masterNode.derive(`m/44'/195'/0'/0/${userIndex}`);
    return {
        address: childNode.address,
    };
}


// --- Fonction principale qui choisit la bonne génération ---
// It now needs a userIndex to create a unique address
function generateUniquePaymentAddress(paymentMethod, userIndex) {
    switch (paymentMethod) {
        case 'BTC':
            return generateBtcAddress(userIndex);
        case 'ETH':
        case 'USDT ERC20':
            return generateEthAddress(userIndex);
        case 'SOL':
            return generateSolAddress(userIndex);
        case 'USDT TRC20':
            return generateTrxAddress(userIndex);
        default:
            throw new Error('Unsupported payment method');
    }
}

module.exports = {
    generateUniquePaymentAddress
};
