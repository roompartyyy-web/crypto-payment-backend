const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { Keypair, PublicKey } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// Tes clés privées maîtres (elles seront lues depuis les variables d'environnement sur Render)
const MASTER_BTC_WIF = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
const MASTER_ETH_PRIVATE_KEY = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
const MASTER_SOL_PRIVATE_KEY = process.env.MASTER_SOL_WALLET_PRIVATE_KEY;
const MASTER_TRX_PRIVATE_KEY = process.env.MASTER_TRX_WALLET_PRIVATE_KEY;

// --- Génération d'adresse unique pour Bitcoin ---
function generateBtcAddress(userIndex) {
    const masterNode = bitcoin.HDNode.fromSeedHex(bitcoin.crypto.sha256(Buffer.from(MASTER_BTC_WIF)));
    const childNode = masterNode.derivePath(`m/44'/0'/0'/0/${userIndex}`);
    return {
        address: childNode.getAddress(),
        privateKey: childNode.toWIF() // En cas de besoin, mais on enverra au master
    };
}

// --- Génération d'adresse unique pour Ethereum ---
function generateEthAddress(userIndex) {
    const wallet = new ethers.Wallet(MASTER_ETH_PRIVATE_KEY);
    const basePath = "m/44'/60'/0'/0";
    const hdNode = ethers.HDNodeWallet.fromSeed(MASTER_ETH_PRIVATE_KEY).derivePath(basePath);
    const childNode = hdNode.derivePath(userIndex.toString());
    return {
        address: childNode.address,
        privateKey: childNode.privateKey
    };
}

// --- Génération d'adresse unique pour Solana ---
function generateSolAddress(userIndex) {
    const keypair = Keypair.fromSeed(Buffer.from(MASTER_SOL_PRIVATE_KEY, 'base64'));
    // Note: Solana n'a pas de dérivation HD standard comme BTC/ETH.
    // Pour un vrai système, on utiliserait un portefeuille HD comme dans l'exemple Solana.
    // Pour simplifier, on peut générer une nouvelle paire pour chaque transaction et la lier au master.
    // Pour l'instant, on retourne l'adresse du portefeuille maître. C'est une simplification.
    // Une implémentation plus robuste utiliserait un schéma de dérivation.
    const newKeypair = Keypair.generate();
    return {
        address: newKeypair.publicKey.toString(),
        // La logique pour envoyer les fonds de cette adresse au master doit être implémentée
    };
}

// --- Génération d'adresse unique pour Tron (USDT TRC20) ---
function generateTrxAddress(userIndex) {
    const masterNode = TronWeb.fromMnemonic(MASTER_TRX_PRIVATE_KEY); // Simplification, suppose que la clé est une mnemonic
    const childNode = masterNode.derive(`m/44'/195'/0'/0/${userIndex}`);
    return {
        address: childNode.address,
        privateKey: childNode.privateKey
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
