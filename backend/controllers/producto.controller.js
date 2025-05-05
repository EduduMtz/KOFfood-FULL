const db = require('../db/connection');

// Obtener todos los productos
exports.obtenerProductos = (req, res) => {
  const sql = `SELECT * FROM productos`;

    db.query(sql, (err, rows) => {
        if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).json({ error: 'Error al obtener productos' });
        }

        // Parsear preparaciones si vienen como string JSON
        const productos = rows.map(prod => ({
        ...prod,
        preparaciones: prod.preparaciones ? JSON.parse(prod.preparaciones) : []
        }));

        res.json(productos);
    });
    };

    // Crear un nuevo producto con ingredientes
    exports.crearProducto = (req, res) => {
    const { nombre, descripcion, precio, categoria, imagen, preparaciones, ingredientes } = req.body;
    const sql = `INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, preparaciones) VALUES (?, ?, ?, ?, ?, ?)`;
    const preparacionesJSON = JSON.stringify(preparaciones || []);

    db.query(sql, [nombre, descripcion, precio, categoria, imagen, preparacionesJSON], (err, result) => {
        if (err) {
        console.error('Error al guardar producto:', err);
        return res.status(500).json({ error: 'Error al guardar producto' });
        }

        const productoId = result.insertId;

        if (ingredientes && ingredientes.length > 0) {
        const valores = ingredientes.map(idIng => [productoId, idIng]);
        db.query(`INSERT INTO producto_ingredientes (producto_id, ingrediente_id) VALUES ?`, [valores], (err2) => {
            if (err2) {
            console.error('Error al guardar ingredientes:', err2);
            return res.status(500).json({ error: 'Producto creado pero error en ingredientes' });
            }
            res.json({ mensaje: 'Producto y ingredientes guardados', id: productoId });
        });
        } else {
        res.json({ mensaje: 'Producto guardado sin ingredientes', id: productoId });
        }
    });
    };

    // Editar producto
    exports.editarProducto = (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio, categoria, preparaciones } = req.body;
    const preparacionesJSON = JSON.stringify(preparaciones || []);

    const sql = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, preparaciones = ? WHERE id = ?`;

    db.query(sql, [nombre, descripcion, precio, categoria, preparacionesJSON, id], (err) => {
        if (err) {
        console.error('Error al editar producto:', err);
        return res.status(500).json({ error: 'Error al editar producto' });
        }

        res.json({ mensaje: 'Producto actualizado' });
    });
    };

    // Eliminar producto
    exports.eliminarProducto = (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM productos WHERE id = ?`;

    db.query(sql, [id], (err) => {
        if (err) {
        console.error('Error al eliminar producto:', err);
        return res.status(500).json({ error: 'Error al eliminar producto' });
        }

        res.json({ mensaje: 'Producto eliminado correctamente' });
    });
};
