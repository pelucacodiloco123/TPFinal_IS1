const formE1 = document.querySelector('.form'); //Selecciona la clase con ese nombre
//Document representa la pagina actual en la que nos encontramos. # es para el id, . para una clase

/*---
	Intercepta el submit del formulario
	*/

formE1.addEventListener('submit', (event) => { //Le dice al navegador: Despues del submit, ejecutá esta función”.
	event.preventDefault(); //Por defecto, cuando un formulario se envía, el navegador:Recarga la página, o Envía los datos al servidor.
                            //event.preventDefault() evita ese comportamiento automático.
                            //Esto permite que el envío se maneje con JavaScript, por ejemplo, para: Validar los datos. Enviar la información con fetch() (AJAX). Mostrar un mensaje sin recargar la página.
	const formData = new FormData(formE1);  //Captura todos los campos y valores del formulario llamados al principio
	const data = Object.fromEntries(formData); // Convierte FormData en un objeto JavaScript común llamado data
	                                           //Esto es para simplificarlo y usar funciones del javascript.
											   //En vez de usarlo como json

	console.log(data); // Muestra los datos del formulario en la consola

	/*---
		Realiza validaciones en los datos del formulario antes de procesar
		*/

	if (data.contacto == '') { //Aca se remplazo para que se chequee que si hay mail, y no un id a la hora del login
		console.log('debe indicar usuario');
		document.getElementById('resultado1').style.color = 'RED'; //Colores del error y eso
		document.getElementById('resultado1').style.textAlign = 'center';
		document.getElementById('resultado1').textContent = 'Debe informar usuario para  completar el acceso';
		return;  //Se modifica resultado1 para que sea solo error del usuario
	}
	 //se dividio en dos como el diseño pedido en el tp, un error arriba y otro abajo.
	if (data.password == '') { //Chequea que haya una password
		console.log('debe indicar password');
		document.getElementById('resultado3').style.color = 'RED';  //Se creo el resultado3, que es el error de la password sola.
		document.getElementById('resultado3').style.textAlign = 'center';
		document.getElementById('resultado3').textContent =
			'Debe informar password para  completar el acceso';
		return;
	}


	if (data.id == 'pec') {   /*--Fix hecho por  Germán Lombardi IS1-2025 */ //Esto dice que si el id es pec, no te deje entrar
		console.log('pec no es bienvenido en éste sistema');
		const m = '<li>El usuario <pec> no es bienvenido en éste sistema</li>';
		document.getElementById('resultado2').style.color = 'RED';
		document.getElementById('resultado2').style.textAlign = 'center';
		document.getElementById('resultado2').textContent =
			'El usuario <pec> no es bienvenido en éste sistema';
		return;
	}
	if (data.termscondition != 'on') { //Chequea si aceptaste los terminos y condiciones
		console.log('no aceptó los T&C no se puede loggear');
		document.getElementById('resultado2').style.textAlign = 'center';
		document.getElementById('resultado2').style.color = 'RED';
		document.getElementById('resultado2').textContent =
			'Debe aceptar los T&C para poder usar el sistema';
		return;
	}

	/*---
		Genera objeto HTML a ser actualizado en el tag identificado como "app"
		*/

	const HTMLResponse = document.querySelector('#app'); //Busca el <div id="app"> del HTML para poder usarlo desde JS.
	const ul = document.createElement('ul'); //Crea una lista <ul> desde cero, en memoria, pero aún no la muestra.
	const tpl = document.createDocumentFragment();  //Esto crea un contenedor invisible en memoria llamado tpl.
	                                                // Es como un carrito donde metés varias cosas antes de ponerlas todas de golpe en el DOM.
	const systemURL = { //Es un objeto que guarda URLs de páginas HTML locales, que forman parte del frontend.
		listarTicket: 'http://127.0.0.1:5500/HTML/listarTicket.html', 
		loginCliente: 'http://127.0.0.1:5500/HTML/loginClient.html',
		signup: 'http://127.0.0.1:5500/HTML/signinClient.html',
		CambioContra: 'http//127.0.0.1:550/HTML/CambioContra.html'
	};

	const RESTAPI = { //Este objeto tiene las URLs del backend (corriendo en localhost:8080).
		loginCliente: 'http://localhost:8080/api/loginCliente', //Para enviar o pedir datos al servidor
		listarTicket: 'http://localhost:8080/api/listarTicket',
	};

	/*-----
		Define el URI para realizar el acceso en base al acceso a un servidor local
	*/

	//Dato: Las API comunican el frontend con el backend.
	//Cuando login o listar tickets necesita datos del servidor, usa JavaScript para hablar con el backend a través de una API REST.
	const MODE = 'LOCAL'; /*-- Instrucción a cambiar opciones LOCAL, TYPICODE o AWS --*/

	if (MODE == 'LOCAL') { //Usa una API en tu propia computadora
		/*-----
			Crea estructuras para acceder a data del cliente
			*/
		const login = { //Aca se sefine el login, el data es el objecto definido antes como el formulario sacado de los datos insertados.
			contacto: data.contacto,
			password: data.password
		}

		const options = { //Le dice al fetch como hacer la solicitud al backend
			method: 'POST', //Es con un post
			headers: {
				'Content-Type': 'application/json', //Que formato de datos esta enviando
			},
			body: JSON.stringify(login), //que datos esta enviando
		};



		// Logs seguros (sin password)
      console.log('API REST:', RESTAPI.loginCliente);
      console.log('loginCliente: contacto(' + login.contacto + ')');
       console.log('options (body oculto por seguridad)');
		var API = RESTAPI.loginCliente;
		var APIoptions = options;

	};


	/*----------------------------------------------------------------------*/
	/*---- Typicode utilizar id 803a62c8-78c8-4b63-9106-73af216d504b -------*/
	/*                                                                      */
	/* El siguiente código es utilizado para resolver la validación de      */
	/* cliente utilizando un "fake" API REST server en Typicode             */
	/* para realizar la validación con el REST API server correcto          */
	/* deberá cambiar la instrucción para que                               */
	/*              const tipycode=false;                                   */
	/*----------------------------------------------------------------------*/


	if (MODE == 'TYPICODE') { //Usa una API de prueba pública
		console.log('Acceso usando Typicode como application server');
		API =
			'https://my-json-server.typicode.com/lu7did/MesaAyuda/posts/' + data.id;
		APIoptions = { method: 'GET' };
	}

	/*----------------------------------------------------------------------*/
	/*---- AWS Accede con URL de Lambda loginUserGET                 -------*/
	/*                                                                      */
	/* cliente: 803a62c8-78c8-4b63-9106-73af216d504b                        */
	/*                                                                      */
	/* Para activar el acceso mediante AWS hacer const aws=true;            */
	/*----------------------------------------------------------------------*/
	if (MODE == 'AWS') { //Usa la API real alojada en Amazon (producción)
		console.log('Acceso usando AWS lambda como application server');
		API = 'https://fmtj0jrpp9.execute-api.us-east-1.amazonaws.com/default/loginUserGET?ID=' + data.id + '&PASSWORD=' + data.password;
		APIoptions = { method: 'GET' };
	}
	/*-----
	Realiza el acceso al API Rest utilizando gestión de sincronización mediante promesas
	utiliza URL y options definidos en los pasos anteriores
	*/

	fetch(`${API}`, APIoptions) //Se hace una request de post definida en APIoptions, al endpoint guardado en API (logincliente)
		.then((res) => {
			return res.json(); //cuando el servidor responde, se lo convierte a json
		})
		.then((users) => { //Users es el objecto que el backend devolvio. Osea el cliente
			console.log(
				'Datos en respuesta del application server=' + JSON.stringify(users) //Console logs para ver si esta todo correcto
			);
			console.log('users.response=' + users.password);
			if (users.response == 'OK') {
				//<==Habilitar esto para dejar que el API REST verifique sin exponer la password
				console.log('La password es correcta');
				console.log(
					'nombre(' +
					users.nombre +
					') fecha_ultimo_ingreso(' +
					users.fecha_ultimo_ingreso +
					')' +
					'mode(' + MODE + ')'
				);
				console.log(
					'id=' +
					users.id +
					' nombre=' +
					users.nombre +
					' ultimo=' +
					users.fecha_ultimo_ingreso
				);
				console.log(
					'changing to ' +  //Otro console log
					systemURL.listarTicket +
					'?id=' +
					users.id +
					'&contacto=' +
					users.contacto +
					'&nombre=' +
					users.nombre +
					'&fecha_ultimo_ingreso=' +
					users.fecha_ultimo_ingreso +
					'&mode=' + MODE //aca se muestra el modo
				);
				window.location.href =   //Redirije a listarticket si esta todo bien
					systemURL.listarTicket +
					'?id=' +
					users.id +
					'&contacto=' +
					users.contacto +
					'&nombre=' +
					users.nombre +
					'&fecha_ultimo_ingreso=' +
					users.fecha_ultimo_ingreso +
					'&mode=' + MODE; //Aca se muestra en que modo estas
			} else {
				console.log('La password no es correcta');
				document.getElementById('resultado3').style.color = 'RED'; //Muestra error si algo falla /*--Fix hecho por  Germán Lombardi IS1-2025 */
				document.getElementById('resultado3').textContent =
					'Error de login, intente nuevamente';                  /*--Fix hecho por  Germán Lombardi IS1-2025 */
			}
		});
});
