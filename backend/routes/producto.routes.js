// backend/routes/producto.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/producto.controller');

router.get('/', controller.obtenerProductos);
router.post('/', controller.crearProducto);
router.put('/:id', controller.editarProducto);
router.delete('/:id', controller.eliminarProducto);




module.exports = router;
