const formEl = document.querySelector('.form');

formEl.addEventListener('submit', (event) => { //Le dice al navegador: Despues del submit, ejecutá esta función”.
	event.preventDefault(); //previene que se recargue la pagina.

	const formData = new FormData(formEl);
	const data = Object.fromEntries(formData);  // Convierte FormData en un objeto JavaScript común llamado data
	                                           //Esto es para simplificarlo y usar funciones del javascript.
											   //En vez de usarlo como json


	console.log('Datos del formulario:', data);

	// Validaciones básicas
	if (!data.contacto || !data.password || !data["confirmar contraseña"]) {
		document.getElementById('resultado1').style.color = 'RED';
		document.getElementById('resultado1').textContent =
			'error de login';
		return;
	}

	if (data.password !== data["confirmar contraseña"]) {
		document.getElementById('resultado1').style.color = 'RED';
		document.getElementById('resultado1').textContent =
			'error de login';
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
		fecha_creacion: new Date().toLocaleString(), //Pone la fecha de hoy, y lo localiza a un string a lo que usa en la computadora
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
		body: JSON.stringify(nuevoCliente),
	};

	// Llamamos al servidor
	fetch(RESTAPI.addCliente, options)
		.then((res) => res.json())  //Es el objeto Response crudo que devuelve el fetch()
		                            //usa res.json() para convertirlo a JSON
		.then((response) => { //Es el resultado de res.json() - los datos ya convertidos a objeto JavaScript

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
	const appDiv = document.querySelector('#app'); //Se busca el contenedor
	formEl.style.display = 'none'; // Ocultamos el formulario
      //Remplaza por el formulario por el siguiente mensaje de exito
	appDiv.innerHTML = `
		<div style="text-align:center; background-color:#d8f7cf; border:1px solid #000; padding:20px; border-radius:10px; width:500px; margin:auto;">
			<h2> Cliente registrado con éxito</h2>
			<p><strong>Correo:</strong> ${contacto}</p>
			<p><strong>Fecha de creación:</strong> ${fecha}</p>
			<br>
			<button id="volverLogin">Ir al login</button>
		</div>
	`;
             //Boton
	document.getElementById('volverLogin').addEventListener('click', () => { //devuelve al login
		window.location.href = 'loginClient.html';
	});
}