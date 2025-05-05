function cargarPedidosCocina() {
  fetch('http://localhost:3000/api/pedidos/cocina')
    .then(res => res.json())
    .then(pedidos => {
      const contenedor = document.getElementById('listaPedidosCocina');
      contenedor.innerHTML = '';

      if (pedidos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No hay pedidos para preparar.</p>';
        return;
      }

      pedidos.forEach(pedido => {
        const detalle = pedido.pedido_json;

        const itemsHTML = detalle
          .map(item => `<li>${item.nombre} x${item.cantidad}</li>`) 
          .join('');

        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Mesa ${pedido.mesa}</h5>
            <p><strong>Cliente:</strong> ${pedido.cliente}</p>
            <ul>${itemsHTML}</ul>
            <button class="btn btn-primary" onclick="marcarComoListo(${pedido.id})">Marcar como listo</button>
          </div>
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error('Error cargando pedidos:', err));
}

function marcarComoListo(id) {
  fetch(`http://localhost:3000/api/pedidos/cocina/listo/${id}`, {
    method: 'POST'
  })
    .then(res => res.json())
    .then(data => {
      Swal.fire('✅ Pedido listo', 'El cliente será notificado.', 'success');
      cargarPedidosCocina();
    })
    .catch(err => console.error('Error al marcar como listo:', err));
}

document.addEventListener('DOMContentLoaded', cargarPedidosCocina);
