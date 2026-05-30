const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); // Pour charger les variables d'environnement

// Routes
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// Connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour autoriser les requêtes depuis ton frontend
app.use(cors());
app.use(express.json()); // Pour lire le JSON dans les requêtes POST

// Routes de l'API
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Route de test pour voir si le serveur est en ligne
app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));