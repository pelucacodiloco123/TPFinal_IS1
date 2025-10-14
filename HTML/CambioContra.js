/* CambioContra.js
   Valida que las dos contraseñas nuevas coincidan y llama a /api/resetCliente
*/

const form = document.getElementById('cambioForm');
const mensaje = document.getElementById('mensaje');
const submitBtn = document.getElementById('submitBtn');

function mostrar(msg, ok = true) {
  if (mensaje) {
    mensaje.textContent = msg;
    mensaje.style.color = ok ? 'green' : 'red';
  } else {
    alert(msg);
  }
}

if (form) {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    submitBtn.disabled = true;

    const email = document.getElementById('emailUsuario')?.value?.trim();
    const passActual = document.getElementById('passwordActual')?.value || '';
    const pass1 = document.getElementById('passwordNueva')?.value || '';
    const pass2 = document.getElementById('passwordNueva2')?.value || '';

    if (!email) {
      mostrar('Por favor ingrese su email (id).', false);
      submitBtn.disabled = false;
      return;
    }

    if (!pass1 || !pass2) {
      mostrar('Complete ambas casillas de nueva contraseña.', false);
      submitBtn.disabled = false;
      return;
    }

    if (pass1 !== pass2) {
      mostrar('Las contraseñas no coinciden.', false);
      submitBtn.disabled = false;
      return;
    }

    // En este ejemplo la API espera { id, password }
    const payload = {
      id: email,
      password: pass1
    };

    try {
      const resp = await fetch('/api/resetCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await resp.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = { response: 'ERROR', message: text }; }

      if (resp.ok) {
        mostrar('Contraseña actualizada correctamente. Puede volver a iniciar sesión.');
        // opcional: redirigir al login después de 2s
        setTimeout(() => { window.location.href = 'loginClient.html'; }, 2000);
      } else {
        const msg = data?.message || JSON.stringify(data);
        mostrar('Error al actualizar: ' + msg, false);
      }
    } catch (err) {
      mostrar('Error de conexión al servidor: ' + err.message, false);
    } finally {
      submitBtn.disabled = false;
    }
  });
} else {
  console.warn('Formulario de cambio de contraseña no encontrado en la página');
}
