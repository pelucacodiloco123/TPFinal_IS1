const form = document.querySelector("#resetForm"); //El form del cambiocontra tiene este id
const mensaje = document.querySelector("#resultado1"); //Este es el mensaje de error

form.addEventListener("submit", async (e) => { //Indica que va a haber una espera
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  if (data.password !== data.password2) { //Comprueba si las contraseñas son iguales
    mensaje.style.color = "red";
    mensaje.textContent = "Las contraseñas no coinciden";
    return;
  }

  const body = {
    contacto: data.contacto,
    password: data.password,
  };

  try {
    const res = await fetch("http://localhost:8080/api/resetCliente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (json.response === "OK") {
      mensaje.className = "exito";
      mensaje.style.color = "green";
      mensaje.textContent = "Contraseña actualizada.";
     (window.location.href = "loginClient.html");
    } else {
      mensaje.className = "mensaje";
      mensaje.style.color = "red";
      mensaje.textContent = json.message || "Error al actualizar";
    }
  } catch (err) {
    mensaje.style.color = "red";
    mensaje.textContent = "Error de red: " + err;
  }
});