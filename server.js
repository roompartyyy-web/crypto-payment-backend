const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// Routes
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// Connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware groupés pour la performance
app.use(cors());
app.use(express.json());

// Routes de l'API
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
