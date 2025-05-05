const express = require('express');
const router = express.Router();
const ingredienteController = require('../controllers/ingrediente.controller');

router.get('/', ingredienteController.obtenerIngredientes);
router.post('/', ingredienteController.crearIngrediente);
router.put('/:id', ingredienteController.editarIngrediente);
router.delete('/:id', ingredienteController.eliminarIngrediente);

module.exports = router;
