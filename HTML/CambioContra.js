const form = document.querySelector("#resetForm"); //El form del cambiocontra tiene este id, haciendo que lo agarre con el queryselector
const mensaje = document.querySelector("#resultado1"); //Este es el mensaje de error
//Document representa la pagina actual en la que nos encontramos. # es para el id, . para una clase

form.addEventListener("submit", async (event) => { //Indica que va a haber una espera
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  if (data.password !== data.password2) { //Comprueba si las contraseñas son iguales
    mensaje.style.color = "red";
    mensaje.textContent = "Las passwords no coinciden";
    return;
  }
  if (!data.contacto) {
		document.getElementById('resultado2').style.color = 'RED';
		document.getElementById('resultado2').textContent =
			'error de login ';
		return;
	}

  const body = { //Se crea un objecto body que es lo que se va a enviar al servidor para actualizarlo
    contacto: data.contacto,
    password: data.password,
  };
  const RESTAPI = {
		resetCliente: 'http://localhost:8080/api/resetCliente', //backend
	};

	// Configuración del fetch
	const options = { //metodo que va a hacer
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body), //transforma el body en json
	};

fetch(RESTAPI.resetCliente, options)
		.then((res) => res.json()) //res es la respuesta en HTTP y lo convierte a un json.
		.then((response) => { //Response es el objecto javascript final
			console.log('Respuesta del servidor:', response);

			if (response.response === 'OK') { //y esto es el objecto del backend.response. Osea el la respuesta del objecto.response
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