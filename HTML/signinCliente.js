const form = document.querySelector("#registroForm");
const mensaje = document.querySelector("#mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  // Validaciones
  if (!data.nombre || data.nombre.trim() === "") {
    mensaje.textContent = "Debe ingresar su nombre completo";
    return;
  }

  if (data.password !== data.password2) {
    mensaje.textContent = "Las contraseñas no coinciden";
    return;
  }

  if (data.terms !== "on") {
    mensaje.textContent = "Debe aceptar los términos y condiciones";
    return;
  }

  const body = {
    contacto: data.contacto,
    password: data.password,
    nombre: data.nombre.trim()
  };

  try {
    const res = await fetch("http://localhost:8080/api/addCliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (json.response === "OK") {
      mensaje.className = "exito";
      mensaje.textContent = "Usuario creado. Redirigiendo...";
      setTimeout(() => (window.location.href = "loginClient.html"), 1500);
    } else {
      mensaje.className = "mensaje";
      mensaje.textContent = json.message || "Error al registrar";
    }
  } catch (err) {
    mensaje.textContent = "Error de red: " + err;
  }
});
