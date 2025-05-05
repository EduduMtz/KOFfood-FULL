// carrito.js

let carrito = [];
let categoriaActual = '';
let productoSeleccionado = null;

let productosAdmin = JSON.parse(localStorage.getItem('productosAdmin')) || null;
let productosDisponibles = productosAdmin ? organizarProductos(productosAdmin) : productos;

function organizarProductos(listaProductos) {
  const categorias = { bebestibles: [], comida: [], combos: [] };
  listaProductos.forEach(prod => {
    if (categorias[prod.categoria]) {
      categorias[prod.categoria].push(prod);
    }
  });
  return categorias;
}

const grid = document.getElementById('productosGrid');
const titulo = document.getElementById('tituloCategoria');
const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
const modalCarrito = new bootstrap.Modal(document.getElementById('modalCarrito'));

function mostrarProductos(categoria) {
  categoriaActual = categoria;
  titulo.textContent = `Productos - ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
  grid.innerHTML = '';

  if (!productosDisponibles[categoria] || productosDisponibles[categoria].length === 0) {
    grid.innerHTML = '<p class="text-center">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  productosDisponibles[categoria].forEach((prod, i) => {
    const col = document.createElement('div');
    col.className = 'col-md-3 mb-4';
    col.innerHTML = `
      <div class="card h-100" data-index="${i}" style="cursor:pointer;">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}" style="height:180px; object-fit:cover;">
        <div class="card-body text-center">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text text-muted" style="font-size: 0.9rem;">${recortarDescripcion(prod.descripcion)}</p>
        </div>
      </div>`;
    grid.appendChild(col);
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const index = card.getAttribute('data-index');
      productoSeleccionado = productosDisponibles[categoria][index];
      document.getElementById('nombreProductoSeleccionado').textContent = productoSeleccionado.nombre;
      document.getElementById('cantidadSeleccionada').value = 1;
      modal.show();
    });
  });
}

function recortarDescripcion(texto) {
  if (texto.length > 60) return texto.slice(0, 57) + '...';
  return texto;
}

async function agregarAlCarrito() {
    const cantidad = parseInt(document.getElementById('cantidadSeleccionada').value);
  
    if (cantidad > 0 && productoSeleccionado) {
      if (productoSeleccionado.preparaciones && productoSeleccionado.preparaciones.length > 0) {
        // Si el producto tiene preparaciones
        const preparacionesElegidas = [];
  
        for (let i = 1; i <= cantidad; i++) {
          const { value: preparacion } = await Swal.fire({
            title: `Elige preparación #${i}`,
            input: 'select',
            inputOptions: productoSeleccionado.preparaciones.reduce((acc, prep) => {
              acc[prep] = prep;
              return acc;
            }, {}),
            inputPlaceholder: 'Selecciona una opción',
            showCancelButton: false,
            confirmButtonText: 'Seleccionar',
            allowOutsideClick: false
          });
  
          if (preparacion) {
            preparacionesElegidas.push(preparacion);
          } else {
            Swal.fire('Error', 'Debes seleccionar una preparación', 'error');
            return;
          }
        }
  
        // Guardamos cada unidad con su preparación individual
        preparacionesElegidas.forEach(preparacion => {
          carrito.push({
            ...productoSeleccionado,
            cantidad: 1,
            preparacionElegida: preparacion
          });
        });
  
        actualizarContador();
        modal.hide();
  
      } else {
        // Si no tiene preparaciones
        carrito.push({
          ...productoSeleccionado,
          cantidad
        });
        actualizarContador();
        modal.hide();
      }
    } else {
      Swal.fire('Error', 'Debe seleccionar un producto válido', 'error');
    }
  }
  

function mostrarCarrito() {
  const contenedor = document.getElementById('carritoContenido');
  contenedor.innerHTML = '';

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p>No hay productos en el carrito.</p>';
    return;
  }

  carrito.forEach((item, i) => {
    contenedor.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>${item.nombre} ${item.preparacionElegida ? '(' + item.preparacionElegida + ')' : ''} x ${item.cantidad} - $${item.precio * item.cantidad}</div>
        <button class="btn btn-sm btn-danger" onclick="eliminarItem(${i})">Eliminar</button>
      </div>`;
  });

  modalCarrito.show();
}

function eliminarItem(index) {
  carrito.splice(index, 1);
  actualizarContador();
  mostrarCarrito();
}

function actualizarContador() {
  document.getElementById('contadorCarrito').textContent = carrito.length;
}
