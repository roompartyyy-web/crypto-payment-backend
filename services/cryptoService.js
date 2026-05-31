// --- FONCTION DE TEST ---
// On retourne une adresse fixe pour voir si le reste du système fonctionne.
function generateUniquePaymentAddress(paymentMethod) {
    console.log(`Génération d'adresse pour la méthode: ${paymentMethod}`);
    return {
        address: "TEST_ADDRESS_OK_FOR_NOW" // Adresse fixe pour le test
    };
}

module.exports = {
    generateUniquePaymentAddress
};
