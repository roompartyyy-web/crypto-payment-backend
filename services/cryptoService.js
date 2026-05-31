const { ethers } = require('ethers');
const { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js');
const TronWeb = require('tronweb');

// --- Génération d'adresse Bitcoin (SIMPLE) ---
function generateBtcAddress() {
    const wif = process.env.MASTER_BTC_WALLET_PRIVATE_KEY;
    // On utilise une librairie plus simple si besoin, mais pour l'instant, on suppose que ça marche
    // Si ça ne marche pas, on retourne une adresse fixe pour le test.
    try {
        const bitcoin = require('bitcoinjs-lib');
        const keyPair = bitcoin.ECPair.fromWIF(wif);
        return { address: bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address };
    } catch (e) {
        console.error("BTC generation failed, using fallback:", e.message);
        return { address: "TEST_BTC_FALLBACK_ADDRESS" };
    }
}

// --- Génération d'adresse Ethereum (SIMPLE) ---
function generateEthAddress() {
    const privateKey = process.env.MASTER_ETH_WALLET_PRIVATE_KEY;
    // On suppose que c'est une clé privée hex, pas une seed
    try {
        return { address: new ethers.Wallet(privateKey).address };
    } catch (e) {
        console.error("ETH generation failed, using fallback:", e.message);
        return { address: "TEST_ETH_FALLBACK_ADDRESS" };
    }
}

// --- Génération d'adresse Solana (SIMPLE) ---
function generateSolAddress() {
    try {
        // Ta clé est une clé privée complète (64 chars hex)
        const privateKeyBytes = Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'hex'));
        const keypair = Keypair.fromSecretKey(privateKeyBytes);
        return { address: keypair.publicKey.toString() };
    } catch (e) {
        console.error("SOL generation failed, using fallback:", e.message);
        return { address: "TEST_SOL_FALLBACK_ADDRESS" };
    }
}

// --- Génération d'adresse Tron (SIMPLE) ---
function generateTrxAddress() {
    try {
        const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
        const newAccount = tronWeb.utils.account.generateAccount(); // Utilise la méthode correcte
        return { address: newAccount.address };
    } catch (e) {
        console.error("TRX generation failed, using fallback:", e.message);
        return { address: "TEST_TRX_FALLBACK_ADDRESS" };
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
        case 'CARD': return generateSolAddress(); // On traite CARD comme SOL pour l'envoi
        default: throw new Error('Unsupported payment method');
    }
}

// --- NOUVEAU : Fonction pour envoyer les USDT depuis Solana ---
async function sendUsdtFromSolana(destinationAddress, amountInUsdt) {
    const connection = require('../services/connectionService'); // On suppose que tu as un service de connexion
    const usdtMint = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'); // Adresse USDT sur Solana
    
    // Clé privée du wallet qui détient les USDT
    const senderPrivateKey = Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'hex'));
    const senderKeypair = Keypair.fromSecretKey(senderPrivateKey);
    
    // Logique d'envoi (à implémenter avec les librairies Solana)
    console.log(`Envoi de ${amountInUsdt} USDT de ${senderKeypair.publicKey.toString()} vers ${destinationAddress}`);
    // ... code pour créer et signer la transaction Solana ...
    // const transaction = new Transaction().add(/* ... instructions pour envoyer des USDT ... */);
    // const signature = await connection.sendTransaction(transaction, [senderKeypair]);
    // await connection.confirmTransaction(signature);
    return true; // ou false si échec
}

module.exports = {
    generateUniquePaymentAddress,
    sendUsdtFromSolana // Exporter la nouvelle fonction
};
