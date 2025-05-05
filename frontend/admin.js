const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const loginDiv = document.getElementById('loginAdmin');
const panelDiv = document.getElementById('panelAdmin');
const btnLogin = document.getElementById('btnLogin');
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tablaProductos').querySelector('tbody');

if (localStorage.getItem('adminLoggedIn') === 'true') {
  loginDiv.style.display = 'none';
  panelDiv.style.display = 'block';
  obtenerProductosDesdeBD();
  mostrarIngredientesCrud();
}

btnLogin.addEventListener('click', () => {
  const usuario = document.getElementById('usuario').value.trim();
  const contrasena = document.getElementById('contrasena').value.trim();

  if (usuario === ADMIN_USER && contrasena === ADMIN_PASS) {
    Swal.fire('Bienvenido', 'Acceso concedido', 'success');
    localStorage.setItem('adminLoggedIn', 'true');
    loginDiv.style.display = 'none';
    panelDiv.style.display = 'block';
    obtenerProductosDesdeBD();
    mostrarIngredientesCrud();
  } else {
    Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
  }
});

// Agregar producto
formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formProducto);
  try {
    const res = await fetch('http://localhost:3000/api/productos', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Error al guardar producto');
    Swal.fire('Producto agregado', '', 'success');
    formProducto.reset();
    obtenerProductosDesdeBD();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
});

function obtenerProductosDesdeBD() {
  fetch('http://localhost:3000/api/productos')
    .then(res => res.json())
    .then(mostrarProductos)
    .catch(() => Swal.fire('Error', 'No se pudieron cargar los productos', 'error'));
}

function mostrarProductos(lista) {
  tablaProductos.innerHTML = '';
  if (!lista.length) {
    tablaProductos.innerHTML = '<tr><td colspan="6">No hay productos</td></tr>';
    return;
  }

  lista.forEach(producto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.descripcion}</td>
      <td>$${producto.precio}</td>
      <td>${producto.categoria}</td>
      <td><img src="http://localhost:3000${producto.imagen}" width="50" /></td>
      <td>
        <button class="btn btn-sm btn-warning" onclick='editarProducto(${JSON.stringify(producto)})'>Editar</button>
        <button class="btn btn-sm btn-danger" onclick='eliminarProducto(${producto.id})'>Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });
}

function eliminarProducto(id) {
  Swal.fire({
    title: '¿Eliminar producto?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/productos/${id}`, { method: 'DELETE' })
        .then(() => {
          Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
          obtenerProductosDesdeBD();
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar el producto', 'error'));
    }
  });
}

function editarProducto(producto) {
  fetch('http://localhost:3000/api/ingredientes')
    .then(res => res.json())
    .then(ingredientesDisponibles => {
      const ingredientesMarcados = producto.ingredientes || [];
      const ingredientesHTML = ingredientesDisponibles.map(ing => {
        const checked = ingredientesMarcados.includes(ing.id) ? 'checked' : '';
        return `
          <div>
            <label>
              <input type="checkbox" name="edit_ingredientes" value="${ing.id}" ${checked}>
              ${ing.nombre} ($${ing.precio})
            </label>
          </div>
        `;
      }).join('');

      let preparacionesTexto = '';
      try {
        const preparacionesArray = typeof producto.preparaciones === 'string' ? JSON.parse(producto.preparaciones) : producto.preparaciones;
        if (Array.isArray(preparacionesArray)) {
          preparacionesTexto = preparacionesArray.join(', ');
        }
      } catch (e) {
        preparacionesTexto = '';
      }

      Swal.fire({
        title: 'Editar Producto',
        html: `
          <input id="editNombre" class="swal2-input" placeholder="Nombre" value="${producto.nombre}">
          <input id="editDescripcion" class="swal2-input" placeholder="Descripción" value="${producto.descripcion}">
          <input id="editPrecio" type="number" class="swal2-input" placeholder="Precio" value="${producto.precio}">
          <input id="editCategoria" class="swal2-input" placeholder="Categoría" value="${producto.categoria}">
          <input id="editPreparaciones" class="swal2-input" placeholder="Preparaciones" value="${preparacionesTexto}">
          <label class="mt-2">Cambiar Imagen (opcional)</label>
          <input type="file" id="editImagen" accept="image/*" class="form-control mt-1">
          <div class="mt-3"><strong>Ingredientes:</strong></div>
          ${ingredientesHTML}
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        preConfirm: () => {
          const nombre = document.getElementById('editNombre').value.trim();
          const descripcion = document.getElementById('editDescripcion').value.trim();
          const precio = parseFloat(document.getElementById('editPrecio').value);
          const categoria = document.getElementById('editCategoria').value.trim();
          const preparaciones = document.getElementById('editPreparaciones').value.trim().split(',').map(p => p.trim());
          const imagen = document.getElementById('editImagen').files[0];
          const ingredientes = Array.from(document.querySelectorAll('input[name="edit_ingredientes"]:checked')).map(i => parseInt(i.value));

          const formData = new FormData();
          formData.append('nombre', nombre);
          formData.append('descripcion', descripcion);
          formData.append('precio', precio);
          formData.append('categoria', categoria);
          formData.append('preparaciones', JSON.stringify(preparaciones));
          formData.append('ingredientes', JSON.stringify(ingredientes));
          if (imagen) formData.append('imagen', imagen);

          return fetch(`http://localhost:3000/api/productos/${producto.id}`, {
            method: 'PUT',
            body: formData
          }).then(res => {
            if (!res.ok) throw new Error('Error al actualizar');
            return res.json();
          });
        }
      }).then(result => {
        if (result.isConfirmed) {
          Swal.fire('Producto actualizado', '', 'success');
          obtenerProductosDesdeBD();
        }
      });
    });
}

// CRUD Ingredientes

function mostrarIngredientesCrud() {
  fetch('http://localhost:3000/api/ingredientes')
    .then(res => res.json())
    .then(ingredientes => {
      const lista = document.getElementById('listaIngredientes');
      lista.innerHTML = '';
      ingredientes.forEach(ing => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <span>${ing.nombre} - $${ing.precio}</span>
          <div>
            <button class="btn btn-sm btn-primary me-2" onclick="editarIngrediente(${ing.id}, '${ing.nombre}', ${ing.precio})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarIngrediente(${ing.id})">Eliminar</button>
          </div>
        `;
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
    mostrarIngredientesCrud();
    Swal.fire('Ingrediente agregado', '', 'success');
  });
}

function editarIngrediente(id, nombreActual, precioActual) {
  Swal.fire({
    title: 'Editar Ingrediente',
    html: `
      <input id="nuevoNombre" class="swal2-input" value="${nombreActual}" placeholder="Nombre">
      <input id="nuevoPrecio" class="swal2-input" type="number" value="${precioActual}" placeholder="Precio">
    `,
    preConfirm: () => {
      const nuevoNombre = document.getElementById('nuevoNombre').value.trim();
      const nuevoPrecio = parseFloat(document.getElementById('nuevoPrecio').value);
      if (!nuevoNombre || isNaN(nuevoPrecio)) {
        Swal.showValidationMessage('Nombre y precio son obligatorios');
        return false;
      }
      return { nombre: nuevoNombre, precio: nuevoPrecio };
    }
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/ingredientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
        .then(() => {
          Swal.fire('Actualizado', 'Ingrediente editado correctamente', 'success');
          cargarIngredientes();
          mostrarIngredientesCrud();
        })
        .catch(() => Swal.fire('Error', 'No se pudo editar el ingrediente', 'error'));
    }
  });
}

function eliminarIngrediente(id) {
  Swal.fire({
    title: '¿Eliminar ingrediente?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/ingredientes/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          Swal.fire('Eliminado', 'Ingrediente eliminado correctamente', 'success');
          cargarIngredientes();
          mostrarIngredientesCrud();
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar el ingrediente', 'error'));
    }
  });
}
window.editarProducto = editarProducto;