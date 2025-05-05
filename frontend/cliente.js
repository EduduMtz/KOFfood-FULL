// cliente.js

let datosCliente = {
    mesa: '',
    nombre: '',
    correo: ''
  };
  
  async function solicitarDatosCliente() {
    const { value: formValues } = await Swal.fire({
      title: 'Datos del Cliente',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Número de Mesa">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Correo (opcional)">',
      focusConfirm: false,
      allowOutsideClick: false,
      preConfirm: () => {
        const mesa = document.getElementById('swal-input1').value.trim();
        const nombre = document.getElementById('swal-input2').value.trim();
        const correo = document.getElementById('swal-input3').value.trim();
  
        // Validaciones
        if (!mesa || !/^\d+$/.test(mesa)) {
          Swal.showValidationMessage('Debes ingresar un número de mesa válido (solo números)');
          return false;
        }
        if (!nombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
          return false;
        }
        if (correo && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(correo)) {
          Swal.showValidationMessage('El correo debe tener un formato válido (ej: correo@dominio.com)');
          return false;
        }
  
        return [mesa, nombre, correo || 'No ingresado'];
      }
    });
  
    if (formValues) {
      datosCliente.mesa = formValues[0];
      datosCliente.nombre = formValues[1];
      datosCliente.correo = formValues[2];
    }
  }
  