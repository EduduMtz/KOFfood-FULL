function cargarPedidosEnCaja() {
  fetch('http://localhost:3000/api/pedidos/caja')
    .then(res => res.json())
    .then(pedidos => {
      const contenedor = document.getElementById('listaPedidosCaja');
      contenedor.innerHTML = '';

      if (pedidos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No hay pedidos pendientes.</p>';
        return;
      }

      pedidos.forEach(pedido => {
        const detalle = pedido.pedido_json;

        const itemsHTML = detalle
          .map(item => `<li>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</li>`)
          .join('');

        const total = detalle.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Mesa ${pedido.mesa}</h5>
            <p><strong>Cliente:</strong> ${pedido.cliente}</p>
            <p><strong>Correo:</strong> ${pedido.correo}</p>
            <ul>${itemsHTML}</ul>
            <p><strong>Total:</strong> $${total}</p>
            <button class="btn btn-success" onclick="marcarComoPagado(${pedido.id})">Marcar como pagado</button>
          </div>
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error('Error cargando pedidos:', err));
}

function marcarComoPagado(id) {
  fetch(`http://localhost:3000/api/pedidos/caja/pagar/${id}`, {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      Swal.fire('✔️ Pedido pagado', 'El pedido ha sido enviado a cocina.', 'success');
      cargarPedidosEnCaja();
    })
    .catch(err => console.error('Error al marcar como pagado:', err));
}

document.addEventListener('DOMContentLoaded', cargarPedidosEnCaja);
