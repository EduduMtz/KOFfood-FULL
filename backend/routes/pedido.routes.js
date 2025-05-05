// backend/routes/pedido.routes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

router.post('/', pedidoController.crearPedido); // POST /api/pedidos
router.get('/caja', pedidoController.obtenerPedidosPendientes); // GET /api/pedidos/caja
router.post('/caja/pagar/:id', pedidoController.marcarPagado); // POST /api/pedidos/caja/pagar/:id
router.get('/cocina', pedidoController.obtenerPedidosParaCocina);
router.post('/cocina/listo/:id', pedidoController.marcarListo); // POST /api/pedidos/cocina/listo/:id

module.exports = router;
