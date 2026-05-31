const { ethers } = require('ethers');
const TronWeb = require('tronweb');

// On ne fait que de la conversion simple, plus de dérivation HD pour ETH et TRX
function generateEthAddress() {
    return { address: new ethers.Wallet(process.env.MASTER_ETH_WALLET_PRIVATE_KEY).address };
}
function generateTrxAddress() {
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io', privateKey: process.env.MASTER_TRX_WALLET_PRIVATE_KEY });
    return { address: tronWeb.defaultAddress.base58 };
}

// On garde l'ancien code pour BTC et SOL car il fonctionne
const bitcoin = require('bitcoinjs-lib');
const { Keypair } = require('@solana/web3.js');
function generateBtcAddress(userIndex) {
    const masterNode = bitcoin.HDNode.fromWIF(process.env.MASTER_BTC_WALLET_PRIVATE_KEY);
    return { address: masterNode.derivePath(`m/44'/0'/0'/0/${userIndex}`).getAddress() };
}
function generateSolAddress(userIndex) {
    const masterKeypair = Keypair.fromSeed(Uint8Array.from(Buffer.from(process.env.MASTER_SOL_WALLET_PRIVATE_KEY, 'base64')));
    return { address: Keypair.fromSeed(masterKeypair.secretKey.slice(0, 32)).publicKey.toString() };
}

function generateUniquePaymentAddress(paymentMethod, userIndex) {
    switch (paymentMethod) {
        case 'BTC': return generateBtcAddress(userIndex);
        case 'ETH':
        case 'USDT ERC20': return generateEthAddress();
        case 'SOL': return generateSolAddress(userIndex);
        case 'USDT TRC20': return generateTrxAddress();
        default: throw new Error('Unsupported payment method');
    }
}

module.exports = { generateUniquePaymentAddress };
