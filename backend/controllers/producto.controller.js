const db = require('../db/connection');

exports.crearProducto = (req, res) => {
    const { nombre, descripcion, precio, categoria, preparaciones } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    const preparacionesJSON = JSON.stringify(preparaciones || []);

    const sql = `INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, preparaciones)
                    VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [nombre, descripcion, precio, categoria, imagen, preparacionesJSON], (err, result) => {
        if (err) {
        console.error('❌ Error al crear producto:', err.message);
        return res.status(500).json({ error: 'Error al guardar producto' });
        }

        res.json({ mensaje: 'Producto creado correctamente', id: result.insertId });
    });
};

    exports.obtenerProductos = (req, res) => {
    db.query('SELECT * FROM productos', (err, rows) => {
    if (err) {
        console.error('❌ Error al obtener productos:', err);
        return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(rows);
    });
    };

    exports.editarProducto = (req, res) => {
    const { nombre, descripcion, precio, categoria, preparaciones } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    let preparacionesFinal = '[]';
    try {
    preparacionesFinal = typeof preparaciones === 'string'
        ? JSON.stringify(preparaciones.split(',').map(p => p.trim()))
        : JSON.stringify(preparaciones || []);
    } catch (e) {
    console.error('❌ Error al procesar preparaciones (editar):', e.message);
    }

    let ingredientes = [];
    try {
    if (typeof req.body.ingredientes === 'string') {
        ingredientes = JSON.parse(req.body.ingredientes);
    } else if (Array.isArray(req.body.ingredientes)) {
        ingredientes = req.body.ingredientes;
    }
    } catch (e) {
    console.error('❌ Error al parsear ingredientes (editar):', e.message);
    }

    const sql = imagen
    ? `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, preparaciones = ?, imagen = ? WHERE id = ?`
    : `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, preparaciones = ? WHERE id = ?`;

    const params = imagen
    ? [nombre, descripcion, precio, categoria, preparacionesFinal, imagen, req.params.id]
    : [nombre, descripcion, precio, categoria, preparacionesFinal, req.params.id];

    db.query(sql, params, (err) => {
    if (err) {
        console.error('❌ Error al editar producto:', err);
        return res.status(500).json({ error: 'Error al editar producto' });
    }

    // Limpiar ingredientes antiguos
    db.query('DELETE FROM producto_ingredientes WHERE producto_id = ?', [req.params.id], (errDel) => {
        if (errDel) {
        console.error('❌ Error al eliminar ingredientes antiguos:', errDel);
        return res.status(500).json({ error: 'Producto actualizado, pero falló la limpieza de ingredientes' });
        }

        if (!ingredientes || ingredientes.length === 0) {
        return res.json({ mensaje: 'Producto actualizado sin ingredientes' });
        }

        const sqlIng = `INSERT INTO producto_ingredientes (producto_id, ingrediente_id) VALUES ?`;
        const valores = ingredientes.map(idIng => [req.params.id, idIng]);

        db.query(sqlIng, [valores], (err2) => {
        if (err2) {
            console.error('❌ Error al insertar nuevos ingredientes:', err2);
            return res.status(500).json({ error: 'Producto actualizado, pero falló la asignación de ingredientes' });
        }

        console.log('✅ Ingredientes actualizados para producto:', req.params.id, valores);
        res.json({ mensaje: 'Producto actualizado con ingredientes' });
        });
    });
    });
    };

    exports.eliminarProducto = (req, res) => {
    db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err) => {
    if (err) {
        console.error('❌ Error al eliminar producto:', err);
        return res.status(500).json({ error: 'Error al eliminar producto' });
    }

    console.log('✅ Producto eliminado:', req.params.id);
    res.json({ mensaje: 'Producto eliminado correctamente' });
    });
    };
