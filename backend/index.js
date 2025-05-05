const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

require('dotenv').config();

const pedidoRoutes = require('./routes/pedido.routes');
const productoRoutes = require('./routes/producto.routes');
const ingredienteRoutes = require('./routes/ingrediente.routes');

app.use(cors());
app.use(express.json()); // <= ESTA ES LA LÍNEA IMPORTANTE
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ingredientes', ingredienteRoutes);

app.listen(3000, () => {
  console.log('Servidor backend en http://localhost:3000');
});
