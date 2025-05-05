// script.js

window.onload = function() {
  solicitarDatosCliente();

  // Eventos de navegación de categorías
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const categoria = e.target.getAttribute('href').replace('#', '');
      mostrarProductos(categoria);
    });
  });

  // Evento para aceptar producto
  document.getElementById('aceptarProducto').addEventListener('click', agregarAlCarrito);

  // Evento para abrir carrito
  document.getElementById('carritoBtn').addEventListener('click', mostrarCarrito);

  // Evento para pagar y generar voucher
  document.getElementById('pagarBtn').addEventListener('click', generarVoucher);
};
