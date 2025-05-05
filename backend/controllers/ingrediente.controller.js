const db = require('../db/connection');

exports.obtenerIngredientes = (req, res) => {
  db.query('SELECT * FROM ingredientes WHERE activo = 1', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener ingredientes' });
        res.json(rows);
    });
};

exports.crearIngrediente = (req, res) => {
const { nombre, precio } = req.body;
db.query('INSERT INTO ingredientes (nombre, precio) VALUES (?, ?)', [nombre, precio], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear ingrediente' });
        res.json({ mensaje: 'Ingrediente creado', id: result.insertId });
    });
};

exports.editarIngrediente = (req, res) => {
const { nombre, precio } = req.body;
db.query('UPDATE ingredientes SET nombre = ?, precio = ? WHERE id = ?', [nombre, precio, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al editar ingrediente' });
        res.json({ mensaje: 'Ingrediente actualizado' });
    });
};

exports.eliminarIngrediente = (req, res) => {
db.query('UPDATE ingredientes SET activo = 0 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar ingrediente' });
        res.json({ mensaje: 'Ingrediente eliminado (lógicamente)' });
    });
};
