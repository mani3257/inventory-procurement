require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const purchaseRequestRoutes = require('./routes/purchaseRequestRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');
const supplierAuthRoutes = require('./routes/supplierAuthRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/supplier-auth', supplierAuthRoutes);

app.get('/', (req, res) => {
  res.send('Inventory & Procurement API running');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Server running on port ' + PORT));