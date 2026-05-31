const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('./models/AddressPool');

// Routes
const paymentRoutes = require('./routes/payment');

// Connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes de l'API
app.use('/api/payment', paymentRoutes);

// Route de test
app.get('/', (req, res) => res.send('API is running...'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
