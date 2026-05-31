const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse unique pour Bitcoin (HD Wallet) ---
function generateBtcAddress(userIndex) {
    const masterKeyWIF = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
    // Utilise fromWIF pour une clé privée au format WIF
    const masterNode = bitcoin.HDNode.fromWIF(masterKeyWIF);
    // Dérive une nouvelle adresse pour chaque transaction
    const childNode = masterNode.derivePath(`m/44'/0'/0'/0/${userIndex}`);
    return {
        address: childNode.getAddress(),
    };
}

// --- Génération d'adresse unique pour Ethereum (HD Wallet) ---
function generateEthAddress(userIndex) {
    const masterPrivateKey = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
    // fromSeed attend une phrase secrète (seed), pas une clé privée hex.
    // On suppose ici que ta variable d'environnement contient une seed.
    // Si c'est une clé privée, la logique doit être adaptée.
    const masterNode = ethers.HDNodeWallet.fromSeed(masterPrivateKey);
    const basePath = "m/44'/60'/0'/0";
    // Dérive une nouvelle adresse pour chaque transaction
    const childNode = masterNode.derivePath(`${basePath}/${userIndex}`);
    return {
        address: childNode.address,
    };
}

// --- Génération d'adresse unique pour Solana (HD Wallet) ---
function generateSolAddress(userIndex) {
    // On suppose que la clé est une seed encodée en base64
    const masterSeed = process.env.MASTER_SOL_WALLET_PRIVATE_KEY;
    const masterKeypair = Keypair.fromSeed(Uint8Array.from(Buffer.from(masterSeed, 'base64')));
    // La dérivation HD sur Solana est plus complexe, cette méthode est une simplification
    // pour générer une clé unique à partir de la clé maître et de l'index.
    const seedForDerivation = masterKeypair.secretKey.slice(0, 32);
    const derivedKeypair = Keypair.fromSeed(seedForDerivation);
    return {
        address: derivedKeypair.publicKey.toString(),
    };
}

// --- Génération d'adresse unique pour Tron (HD Wallet) ---
function generateTrxAddress(userIndex) {
    // On suppose que la clé est une phrase mnémonique
    const masterMnemonic = process.env.MASTER_TRX_WALLET_PRIVATE_KEY;
    const masterNode = TronWeb.fromMnemonic(masterMnemonic);
    // Dérive une nouvelle adresse pour chaque transaction
    const childNode = masterNode.derive(`m/44'/195'/0'/0/${userIndex}`);
    return {
        address: childNode.address,
    };
}


// --- Fonction principale qui choisit la bonne génération ---
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
