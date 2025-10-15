const formEl = document.querySelector('.form');

formEl.addEventListener('submit', (event) => {
	event.preventDefault();

	const formData = new FormData(formEl); //se crea las constante formdata y data
	const data = Object.fromEntries(formData);

	console.log('Datos del formulario:', data);

	// Validaciones básicas
	if (!data.contacto || !data.password || !data["confirmar contraseña"]) {
		document.getElementById('resultado1').style.color = 'RED';
		document.getElementById('resultado1').textContent =
			'Debe completar todos los campos';
		return;
	}

	if (data.password !== data["confirmar contraseña"]) {
		document.getElementById('resultado1').style.color = 'RED';
		document.getElementById('resultado1').textContent =
			'Las contraseñas no coinciden';
		return;
	}

	if (data.termscondition != 'on') {
		document.getElementById('resultado2').style.color = 'RED';
		document.getElementById('resultado2').textContent =
			'Debe aceptar los Términos y Condiciones';
		return;
	}

	// Construimos el nuevo usuario
	const nuevoCliente = {
		contacto: data.contacto,
		nombre: data.nombre,
		password: data.password,
		fecha_creacion: new Date().toLocaleString(),
	};

	console.log('Nuevo cliente a registrar:', nuevoCliente);

	// URL del endpoint para registrar usuarios
	const RESTAPI = {
		addCliente: 'http://localhost:8080/api/addCliente',
	};

	// Configuración del fetch
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(nuevoCliente), //transforma el body en json
	};

	// Llamamos al servidor
	fetch(RESTAPI.addCliente, options)
		.then((res) => res.json())
		.then((response) => {
			console.log('Respuesta del servidor:', response);

			if (response.response === 'OK') {
				//  Registro exitoso
				mostrarExito(nuevoCliente.contacto, nuevoCliente.fecha_creacion);
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

function mostrarExito(contacto, fecha) {
	const appDiv = document.querySelector('#app');
	formEl.style.display = 'none'; // Ocultamos el formulario

	appDiv.innerHTML = `
		<div style="text-align:center; background-color:#d8f7cf; border:1px solid #000; padding:20px; border-radius:10px; width:500px; margin:auto;">
			<h2> Cliente registrado con éxito</h2>
			<p><strong>Correo:</strong> ${contacto}</p>
			<p><strong>Fecha de creación:</strong> ${fecha}</p>
			<br>
			<button id="volverLogin">Ir al login</button>
		</div>
	`;

	document.getElementById('volverLogin').addEventListener('click', () => { //devuelve al login
		window.location.href = 'loginClient.html';
	});
}