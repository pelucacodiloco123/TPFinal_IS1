const form = document.querySelector("#resetForm"); //El form del cambiocontra tiene este id, haciendo que lo agarre con el queryselector
const mensaje = document.querySelector("#resultado1"); //Este es el mensaje de error
//Document representa la pagina actual en la que nos encontramos. # es para el id, . para una clase

form.addEventListener("submit", async (event) => { //Indica que va a haber una espera
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  if (data.password !== data.password2) { //Comprueba si las contraseñas son iguales
    mensaje.style.color = "red";
    mensaje.textContent = "Las contraseñas no coinciden";
    return;
  }

  const body = { //Se crea un objecto body que es lo que se va a enviar al servidor para actualizarlo
    contacto: data.contacto,
    password: data.password,
  };
  const RESTAPI = {
		resetCliente: 'http://localhost:8080/api/resetCliente',
	};

	// Configuración del fetch
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body), //transforma el body en json
	};

fetch(RESTAPI.resetCliente, options)
		.then((res) => res.json()) //toma la respuesta de json y lo transforma en un objecto
		.then((response) => {
			console.log('Respuesta del servidor:', response);

			if (response.response === 'OK') {
				//  Registro exitoso
				window.location.href = 'loginClient.html';
			} else {
				//  Error
				document.getElementById('resultado1').style.color = 'RED';
				document.getElementById('resultado1').textContent =
					response.message || 'Error al registrar cliente.';
			}
		})
		.catch((err) => {
			console.error('Error en el fetch:', err);
			document.getElementById('resultado1').style.color = 'RED';
			document.getElementById('resultado1').textContent =
				'Error de conexión con el servidor.';
		});
});