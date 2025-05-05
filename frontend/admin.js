const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const loginDiv = document.getElementById('loginAdmin');
const panelDiv = document.getElementById('panelAdmin');
const btnLogin = document.getElementById('btnLogin');
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tablaProductos').querySelector('tbody');

btnLogin.addEventListener('click', () => {
  const usuario = document.getElementById('usuario').value.trim();
  const contrasena = document.getElementById('contrasena').value.trim();

  if (usuario === ADMIN_USER && contrasena === ADMIN_PASS) {
    Swal.fire('Bienvenido', 'Acceso concedido', 'success');
    loginDiv.style.display = 'none';
    panelDiv.style.display = 'block';
    obtenerProductosDesdeBD();
    cargarIngredientes();
  } else {
    Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
  }
});

formProducto.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreProducto').value.trim();
  const descripcion = document.getElementById('descripcionProducto').value.trim();
  const precio = parseFloat(document.getElementById('precioProducto').value);
  const categoria = document.getElementById('categoriaProducto').value;
  const imagenInput = document.getElementById('imagenProducto');
  const preparacionesTexto = document.getElementById('preparacionesProducto').value.trim();
  const preparaciones = preparacionesTexto ? preparacionesTexto.split(',').map(p => p.trim()) : [];
  const ingredientesSeleccionados = Array.from(document.getElementById('ingredientesProducto').selectedOptions).map(o => parseInt(o.value));

  if (!nombre || !descripcion || !precio || !categoria || imagenInput.files.length === 0) {
    Swal.fire('Todos los campos son obligatorios', '', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imagenBase64 = e.target.result;

    const nuevoProducto = {
      nombre,
      descripcion,
      precio,
      categoria,
      imagen: imagenBase64,
      preparaciones,
      ingredientes: ingredientesSeleccionados
    };

    fetch('http://localhost:3000/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    })
      .then(res => res.json())
      .then(() => {
        Swal.fire('Producto agregado', `${nombre} fue añadido correctamente`, 'success');
        formProducto.reset();
        obtenerProductosDesdeBD();
      })
      .catch(err => {
        console.error('Error al guardar producto:', err);
        Swal.fire('Error', 'No se pudo guardar el producto', 'error');
      });
  };

  reader.readAsDataURL(imagenInput.files[0]);
});

function obtenerProductosDesdeBD() {
  fetch('http://localhost:3000/api/productos')
    .then(res => res.json())
    .then(productos => {
      mostrarProductos(productos);
    })
    .catch(err => {
      console.error('Error al cargar productos:', err);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    });
}

function mostrarProductos(lista) {
  tablaProductos.innerHTML = '';

  if (!lista.length) {
    tablaProductos.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos</td></tr>';
    return;
  }

  lista.forEach(producto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.descripcion}</td>
      <td>$${producto.precio}</td>
      <td>${producto.categoria}</td>
      <td><img src="${producto.imagen}" width="50"></td>
      <td>
        <button class="btn btn-sm btn-warning" onclick='editarProducto(${JSON.stringify(producto)})'>Editar</button>
        <button class="btn btn-sm btn-danger" onclick='eliminarProducto(${producto.id})'>Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
}

function editarProducto(producto) {
  Swal.fire({
    title: 'Editar Producto',
    html: `
      <input id="editNombre" class="swal2-input" placeholder="Nombre" value="${producto.nombre}">
      <input id="editDescripcion" class="swal2-input" placeholder="Descripción" value="${producto.descripcion}">
      <input id="editPrecio" type="number" class="swal2-input" placeholder="Precio" value="${producto.precio}">
      <input id="editCategoria" class="swal2-input" placeholder="Categoría" value="${producto.categoria}">
      <input id="editPreparaciones" class="swal2-input" placeholder="Preparaciones (coma)" value="${producto.preparaciones || ''}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const nombre = document.getElementById('editNombre').value.trim();
      const descripcion = document.getElementById('editDescripcion').value.trim();
      const precio = parseFloat(document.getElementById('editPrecio').value);
      const categoria = document.getElementById('editCategoria').value.trim();
      const preparacionesTexto = document.getElementById('editPreparaciones').value.trim();
      const preparaciones = preparacionesTexto ? preparacionesTexto.split(',').map(p => p.trim()) : [];

      return { nombre, descripcion, precio, categoria, preparaciones, imagen: producto.imagen };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const datos = result.value;

      fetch(`http://localhost:3000/api/productos/${producto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
        .then(res => res.json())
        .then(() => {
          Swal.fire('Actualizado', 'Producto editado correctamente', 'success');
          obtenerProductosDesdeBD();
        })
        .catch(() => Swal.fire('Error', 'No se pudo editar el producto', 'error'));
    }
  });
}

function eliminarProducto(id) {
  Swal.fire({
    title: '¿Eliminar producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
          obtenerProductosDesdeBD();
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
    }
  });
}

function cargarIngredientes() {
  fetch('http://localhost:3000/api/ingredientes')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('ingredientesProducto');
      const lista = document.getElementById('listaIngredientes');
      select.innerHTML = '';
      lista.innerHTML = '';

      data.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id;
        option.textContent = `${ing.nombre} ($${ing.precio})`;
        select.appendChild(option);

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between';
        li.innerHTML = `<span>${ing.nombre} - $${ing.precio}</span>`;
        lista.appendChild(li);
      });
    });
}

function agregarIngrediente() {
  const nombre = document.getElementById('nuevoIngrediente').value.trim();
  const precio = parseFloat(document.getElementById('precioIngrediente').value);
  if (!nombre || isNaN(precio)) {
    Swal.fire('Faltan datos', 'Debes ingresar nombre y precio', 'warning');
    return;
  }

  fetch('http://localhost:3000/api/ingredientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio })
  }).then(() => {
    document.getElementById('nuevoIngrediente').value = '';
    document.getElementById('precioIngrediente').value = '';
    cargarIngredientes();
    Swal.fire('Ingrediente agregado', '', 'success');
  });
}
