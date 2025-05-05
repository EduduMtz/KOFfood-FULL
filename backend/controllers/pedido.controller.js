const db = require('../db/connection');

// Crear un nuevo pedido
exports.crearPedido = (req, res) => {
  const { cliente, mesa, correo, pedido } = req.body;

  const sql = `INSERT INTO pedidos (cliente, mesa, correo, estado, pedido_json) VALUES (?, ?, ?, 'pendiente', ?)`;
  const pedidoJSON = JSON.stringify(pedido);

  db.query(sql, [cliente, mesa, correo, pedidoJSON], (err, result) => {
    if (err) {
      console.error('Error al guardar pedido:', err);
      return res.status(500).json({ error: 'Error al guardar pedido' });
    }
    res.json({ mensaje: 'Pedido guardado correctamente', id: result.insertId });
  });
};

// Obtener pedidos pendientes (para caja)
exports.obtenerPedidosPendientes = (req, res) => {
  const sql = `SELECT * FROM pedidos WHERE estado = 'pendiente'`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al obtener pedidos:', err);
      return res.status(500).json({ error: 'Error al obtener pedidos' });
    }

    const pedidos = rows.map(row => ({
      ...row,
      pedido_json: typeof row.pedido_json === 'string'
        ? JSON.parse(row.pedido_json)
        : row.pedido_json
    }));

    res.json(pedidos);
  });
};

// Marcar pedido como pagado (desde caja)
exports.marcarPagado = (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE pedidos SET estado = 'pagado' WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ error: 'Error al actualizar pedido' });
    }
    res.json({ mensaje: 'Pedido marcado como pagado' });
  });
};

// Obtener pedidos pagados (para cocina)
exports.obtenerPedidosParaCocina = (req, res) => {
  const sql = `SELECT * FROM pedidos WHERE estado = 'pagado'`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al obtener pedidos para cocina:', err);
      return res.status(500).json({ error: 'Error al obtener pedidos para cocina' });
    }

    const pedidos = rows.map(row => ({
      ...row,
      pedido_json: typeof row.pedido_json === 'string'
        ? JSON.parse(row.pedido_json)
        : row.pedido_json
    }));

    res.json(pedidos);
  });
};

// Marcar pedido como listo (desde cocina)
exports.marcarListo = (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE pedidos SET estado = 'listo' WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al marcar como listo:', err);
      return res.status(500).json({ error: 'Error al actualizar pedido' });
    }
    res.json({ mensaje: 'Pedido marcado como listo' });
  });
};
