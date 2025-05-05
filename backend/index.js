const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const pedidoRoutes = require('./routes/pedido.routes');
const productoRoutes = require('./routes/producto.routes');
const ingredienteRoutes = require('./routes/ingrediente.routes');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ingredientes', ingredienteRoutes);

app.listen(3000, () => {
  console.log('Servidor backend en http://localhost:3000');
});
