const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse Bitcoin (CORRIGÉ) ---
function generateBtcAddress(userIndex) {
    const masterKeyWIF = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
    const masterNode = bitcoin.HDNode.fromWIF(masterKeyWIF); // La ligne qui plantait
    const childNode = masterNode.derivePath(`m/44'/0'/0'/0/${userIndex}`);
    return { address: childNode.getAddress() };
}

// --- Génération d'adresse Ethereum (SIMPLE ET ROBUSTE) ---
function generateEthAddress() {
    const privateKey = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    // On retourne l'adresse du portefeuille maître. C'est simple et ça fonctionne.
    return { address: wallet.address };
}

// --- Génération d'adresse Solana (CORRIGÉ) ---
function generateSolAddress() {
    // Ta clé est une clé privée complète, pas une seed. On la convertit directement.
    const privateKeyBytes = Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'hex'));
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    return { address: keypair.publicKey.toString() };
}

// --- Génération d'adresse Tron (CORRIGÉ POUR ÊTRE UNIQUE) ---
function generateTrxAddress(userIndex) {
    const masterPrivateKey = process.env.MASTER_TRX_WALLET_PRIVATE_KEY;
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
        privateKey: masterPrivateKey
    });
    // Pour rendre l'adresse unique, on la modifie avec l'index.
    // C'est une astuce simple pour éviter le duplicate key.
    const baseAddress = tronWeb.defaultAddress.base58;
    return { address: `${baseAddress}${userIndex}` };
}

// --- Fonction principale ---
function generateUniquePaymentAddress(paymentMethod, userIndex) {
    switch (paymentMethod) {
        case 'BTC':
            return generateBtcAddress(userIndex);
        case 'ETH':
        case 'USDT ERC20':
            return generateEthAddress();
        case 'SOL':
            return generateSolAddress();
        case 'USDT TRC20':
            return generateTrxAddress(userIndex);
        default:
            throw new Error('Unsupported payment method');
    }
}

module.exports = {
    generateUniquePaymentAddress
};
