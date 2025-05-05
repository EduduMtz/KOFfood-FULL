// voucher.js

function generarVoucher() {
  if (carrito.length === 0) {
    Swal.fire('Carrito vacío', 'No tienes productos para confirmar.', 'warning');
    return;
  }

  const pedidoDetalle = carrito.map(item => {
    const nombre = item.preparacionElegida ? `${item.nombre} (${item.preparacionElegida})` : item.nombre;
    return `- ${nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;
  }).join('\n');

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  Swal.fire({
    title: '¡Pedido Confirmado!',
    html: `
      <h5>Cliente:</h5> <p>${datosCliente.nombre}</p>
      <h5>Mesa:</h5> <p>${datosCliente.mesa}</p>
      <h5>Correo:</h5> <p>${datosCliente.correo}</p>
      <hr>
      <h5>Pedido:</h5>
      <pre style="text-align:left;">${pedidoDetalle}</pre>
      <h5>Total:</h5> <p><strong>$${total}</strong></p>
      <hr>
      <p><strong>¡Acércate a caja para concretar tu pedido! 🎉</strong></p>
    `,
    icon: 'success',
    showCancelButton: true,
    cancelButtonText: 'Cerrar',
    confirmButtonText: '📥 Descargar PDF'
  }).then(result => {
    if (result.isConfirmed) {
      enviarPedidoAlBackend();
      generarPDFVoucher(datosCliente, carrito);
      carrito = [];
      actualizarContador();
      modalCarrito.hide();

      const audio = new Audio('assets/sounds/ding.mp3');
      audio.play();

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '¡Orden enviada a caja! 💳',
        toast: true,
        showConfirmButton: false,
        timer: 1500
      });
    }
  });
}

function enviarPedidoAlBackend() {
  const pedido = {
    cliente: datosCliente.nombre,
    mesa: datosCliente.mesa,
    correo: datosCliente.correo,
    pedido: carrito.map(item => ({
      nombre: item.preparacionElegida ? `${item.nombre} (${item.preparacionElegida})` : item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  fetch('http://localhost:3000/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pedido)
  })
  .then(res => res.json())
  .then(data => console.log('✅ Pedido enviado:', data))
  .catch(err => console.error('❌ Error al enviar pedido:', err));
}

function guardarOrdenEnCaja() {
  const ordenes = JSON.parse(localStorage.getItem('ordenesEnCaja')) || [];

  const nuevaOrden = {
    id: Date.now(),
    cliente: datosCliente.nombre,
    mesa: datosCliente.mesa,
    correo: datosCliente.correo,
    pedido: carrito.map(item => ({
      nombre: item.preparacionElegida ? `${item.nombre} (${item.preparacionElegida})` : item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  ordenes.push(nuevaOrden);
  localStorage.setItem('ordenesEnCaja', JSON.stringify(ordenes));
}

function generarPDFVoucher(datosCliente, carrito) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const pedidoTexto = carrito.map(item => {
    const nombre = item.preparacionElegida ? `${item.nombre} (${item.preparacionElegida})` : item.nombre;
    return `${nombre} x${item.cantidad} - $${item.precio * item.cantidad}`;
  }).join('\n');

  const datosPedido = {
    cliente: datosCliente.nombre,
    mesa: datosCliente.mesa,
    correo: datosCliente.correo,
    pedido: carrito.map(item => ({
      nombre: item.preparacionElegida ? `${item.nombre} (${item.preparacionElegida})` : item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  const qr = qrcode(0, 'L');
  qr.addData(JSON.stringify(datosPedido));
  qr.make();
  const qrImg = qr.createDataURL();

  doc.setFontSize(14);
  doc.text(`KofFood - Respaldo de Pedido`, 20, 20);
  doc.setFontSize(12);
  doc.text(`Cliente: ${datosCliente.nombre}`, 20, 35);
  doc.text(`Mesa: ${datosCliente.mesa}`, 20, 42);
  doc.text(`Correo: ${datosCliente.correo || 'No informado'}`, 20, 49);
  doc.text(`\nPedido:\n${pedidoTexto}`, 20, 60);
  doc.text(`\nTotal: $${total}`, 20, 90);
  doc.addImage(qrImg, 'PNG', 140, 20, 50, 50);

  doc.save(`pedido_mesa_${datosCliente.mesa}.pdf`);
}
