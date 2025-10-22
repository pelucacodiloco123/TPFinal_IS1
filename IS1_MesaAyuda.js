
/*-----------------------------------------------------------------------------------------------------------------
//*  MesaAyuda.js debe copiarse al directorio del proyecto express como index.js
//*
//*  REST API 
//*  UADER - FCyT - Ingenieria de Software I 
//*  Caso de estudio MesaAyuda
//*
//*  Dr. Pedro E. Colla 2023,2025
 *----------------------------------------------------------------------------------------------------------------*/
//AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=1

import express from 'express'; //Es un framework web para Node.js. Te permite crear fácilmente servidores, rutas y APIs REST. Para manejar peticiones HTTP.
import crypto from 'crypto'; //Es un módulo nativo de Node.js para realizar operaciones de seguridad.
//Crypto funciones: Crear hashes.Generar tokens aleatorios.Encriptar y desencriptar datos.Firmar/verificar información
console.log("Comenzando servidor");

// const crypto = require('crypto');
console.log("crypto Ok!");

//const express = require('express');
//console.log("express Ok!");

const app = express(); //se define app como la clase express
console.log("express ready!");

const PORT = 8080; //declara al puerto donde se va a logear como 8080. El localhost:8080 basicamente

import cors from 'cors'; //Para permitir o restringir el acceso a tu API desde otros dominios (orígenes) Se usa cors.
//Por defecto, los navegadores no permiten que una página web en un dominio haga un fetch o catch a otro.
//  esto se llama una petición cross-origin, y está bloqueada por el navegador por seguridad.
//Esto permite que cualquier frontend en cualquier dominio pueda hacer peticiones a tu backend.
//const cors = require('cors');
console.log("cors ok!");

app.use(cors()); //Usa la funcion use del express con cors
console.log("CORS ready!");

import AWS from 'aws-sdk' //Importa el AWS de Amazon para su uso
//var AWS = require('aws-sdk');
console.log("aws-sdk ready!");

/*----
Acquire critical security resources from an external file out of the path
*/

//const accessKeyId = require('../accessKeyId.js');
//const secretAccessKey = require('../secretAccessKey.js');

import accessKeyId from '../accessKeyId.js'; //Importa las claves necesarias para usar el programa
import secretAccessKey from '../secretAccessKey.js'; //Porfavor abstenerse de subir los archivos a Github o cualquier otro lado.

let awsConfig = {  //La configuracion que se le añadio al AWS
    "region": "us-east-1", //Region de donde esta el servicio
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com", //Url del servicio
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey //las claves
};
//Let es variable local

AWS.config.update(awsConfig);  //Actualiza la configuracion del AWS con lo anterior establecido
console.log("Servidor listo!");
let docClient = new AWS.DynamoDB.DocumentClient(); //Define doc como el objeto principal del Amazon Web Services, que te permite acceder a todos los servicios de AWS desde el código
//evita tener que trabajar con el formato de datos crudo de DynamoDB. una interfaz simplificada con objectos javascript comunes.
//Permite usar get,post,put,update,delete,scan.
/*---- 
   Application server in LISTEN mode
*/

app.listen( //Ve si esta escuchando del otro lado el puerto definido anteriormente
    PORT,
    () => console.log(`Servidor listo en http://localhost:${PORT}`)
);

app.use(express.json());

/*-------------------------------------------------------------------------------------------
                            Funciones y Servicios
 *-------------------------------------------------------------------------------------------*/

/*-----------
función para hacer el parse de un archivo JSON
*/
function jsonParser(keyValue, stringValue) {  //Ej: Key value: Password. StringValue: Data.id

    var string = JSON.stringify(stringValue); //Convierte el Data.id a json
    var objectValue = JSON.parse(string); //Convierte el json a objecto
    return objectValue[keyValue]; //devuelve la informacion de la password.
}   //"Del objeto data.Item, extraé el valor que está en la propiedad password.”

/*-------------------------------------------------------------------------------------------
                            SERVER API 
 *-------------------------------------------------------------------------------------------*/
/*==*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*
 *                       API REST Cliente                                                   *
 *=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*==*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*/

app.get('/api/cliente', (req, res) => {
    res.status(200).send({ response: "OK", message: "API Ready" });
    console.log("API cliente: OK");
});


/*---
  /api/loginCliente
  Esta API permite acceder a un cliente por ID y comparar la password pasada en un JSON en el cuerpo con la indicada en el DB
*/


app.post('/api/loginCliente', async (req, res) => { //async se usa para declarar una función asíncrona, es decir, una función que puede ejecutar operaciones que toman tiempo.

    const { contacto } = req.body; //Crea dos variables llamadas contacto y password y asignales los valores de las propiedades contacto y password del objeto body.
    const { password } = req.body; //El request es una funcion del express.js, que es basicamente le hace un pedido a la database
    const resultados = await scanDb(contacto); //Con el mail se busca los datos del cliente, y se usa un await para esperar que termine la funcion.
    //ScanDB busca dentro de la base de datos al cliente por el valor dado (contacto aca), y lo almacena en la constante resultados
    if (!resultados || resultados.length == 0) { //corrobora que devuelva un resultado
        res.status(400).send({ response: "ERROR", menssage: "Cliente no encontrado" });
        return;
    }
    console.log("resultados=" + JSON.stringify(resultados)) //convierte a json el resultado

    console.log("loginCliente: contacto(" + contacto + ")"); //Se elimino que muestre la contraseña

    if (!password) {
        res.status(400).send({ response: "ERROR", message: "Password no informada" });
        return;
    }
    if (!contacto) {
        res.status(400).send({ response: "ERROR", message: "Contacto no informado" });
        return;
    }
    const cliente = resultados[0];
    const id = cliente.id; //Y aca devuelve el id del cliente que se obtuvo a partir del mail.

    let getClienteByKey = function () {   // Declara una función llamada getClienteByKey y la asigna a una variable del mismo nombre.
        // Esta función busca un cliente en la tabla "cliente" de DynamoDB usando su clave primaria (id).
        var params = {  /// El objeto params contiene los parámetros que necesita DynamoDB para ejecutar la consulta.

            TableName: "cliente", //TableName indica en qué tabla de DynamoDB se va a hacer la operación. En este caso, "cliente" es el nombre de la tabla.
            Key: {         //Key define la clave primaria del registro que querés buscar. "id" es el nombre del atributo que identifica de forma única a cada cliente.
                // El valor id (sin comillas) es una variable de JavaScript que se creo antes.
                "id": id
            }
        };
        docClient.get(params, function (err, data) {  // Usa el método 'get' del DocumentClient para obtener el ítem con la clave especificada.
            // Si ocurre un error de conexión o de acceso, se captura en 'err'. 
            // Si la operación tiene éxito, los datos devueltos se almacenan en 'data'.

            if (err) {
                res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + err }));
            }
            else {
                if (Object.keys(data).length == 0) { //Comprueba si el objecto que es el cliente existe
                    res.status(400).send({ response: "ERROR", message: "Cliente invalido" });
                } else {
                    const paswd = jsonParser('password', data.Item); //Del objeto data.Item, extraé el valor que está en la propiedad password.”
                    const activo = jsonParser('activo', data.Item);
                    const id = jsonParser('id', data.Item);
                    const contacto = jsonParser('contacto', data.Item);
                    if (password == paswd) {
                        if (activo == true) {
                            const nombre = jsonParser('nombre', data.Item);
                            const fecha_ultimo_ingreso = jsonParser('fecha_ultimo_ingreso', data.Item);
                            res.status(200).send(JSON.stringify({ response: "OK", "id": id, "nombre": nombre, "contacto": contacto, "fecha_ultimo_ingreso": fecha_ultimo_ingreso }));
                        } else {
                            res.status(400).send(JSON.stringify({ response: "ERROR", message: "Cliente no activo" }));
                        }
                    } else {
                        res.status(400).send(JSON.stringify({ response: "ERROR", message: "usuario incorrecto" }));
                    }
                }
            }
        })
    }
    getClienteByKey();

});


/*-----------
  /api/getCliente
  Esta API permite acceder a un cliente dado su id
*/

app.post('/api/getCliente/:id', (req, res) => { //Define el endpoint a ser utilizado
    const { id } = req.params; //Extrae el valor de la variable id de los parámetros de la URL de la solicitud
    console.log("getCliente: id(" + id + ")");
    var params = {
        TableName: "cliente", //Y aca, busca en la tabla cliente, por id
        Key: {
            "id": id
            //test use "id": "0533a95d-7eef-4c6b-b753-1a41c9d1fbd0"   
        }
    };
    docClient.get(params, function (err, data) { //Ejecuta el obtener un cliente con la funcion de AWS
        if (err) {
            res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + null }));
        } else {

            if (Object.keys(data).length != 0) {
                res.status(200).send(JSON.stringify({ "response": "OK", "cliente": data.Item }), null, 2);
            } else {
                res.status(400).send(JSON.stringify({ "response": "ERROR", message: "Cliente no existe" }), null, 2);
            }
        }
    })


});

/*---------
Función para realizar el SCAN de un DB de cliente usando contacto como clave para la búsqueda (no es clave formal del DB)
*/
async function scanDb(contacto) { //Declaracion de scanDB, es asincrona asi que se puede hacer un await para esperar una respuesta de DB sin interrumpirla.
    var docClient = new AWS.DynamoDB.DocumentClient(); //el objeto del de AWS que permite interactuar fácilmente con DynamoDB usando JSON en lugar de tipos nativos de DynamoDB.
    const scanKey = contacto; //Guarda el contacto recibido como scankey
    const paramsScan = { // parámetros  que le dicen a DynamoDB qué tabla leer, qué atributos traer y cómo filtrar los resultados.
        TableName: "cliente", // required
        Select: "ALL_ATTRIBUTES" || "ALL_PROJECTED_ATTRIBUTES" || "SPECIFIC_ATTRIBUTES" || "COUNT", //Indica que se deben devolver todos los atributos de cada ítem encontrado.
        FilterExpression: 'contacto = :contacto', //Aca dice que solo se devolveran los atributos que concuerden con el contacto
        ExpressionAttributeValues: { ':contacto': scanKey } //Aca dice que el filtro de contacto es el que se le pase
    };
    var objectPromise = await docClient.scan(paramsScan).promise().then((data) => { //Scanea toda la DB buscando con el parametro dado antes hasta que lo encuentre
        return data.Items
    });
    return objectPromise;
}

/*----
addCliente
Revisa si el contacto (e-mail) existe y en caso que no da de alta el cliente generando un id al azar
*/
app.post('/api/addCliente', (req, res) => {

    const { contacto } = req.body; //Pide los datos del cuerpo del mensaje (por ejemplo, un JSON enviado en un POST
    const { password } = req.body;
    const { nombre } = req.body;

    console.log("addCliente: contacto(" + contacto + ") nombre(" + nombre + ")"); //Se elimino que muestre la password cuando se llama a addcliente

    if (!password) {
        res.status(400).send({ response: "ERROR", message: "Password no informada" });
        return;
    }
    if (!nombre) {
        res.status(400).send({ response: "ERROR", message: "Nombre no informado" });
        return;
    }

    if (!contacto) {
        res.status(400).send({ response: "ERROR", message: "Contacto no informado" });
        return;
    }

    scanDb(contacto) //Busca si existe un usuario ya creado con ese mail
        .then(resultDb => {  //Una promesa (asincronico) dice que en algún momento va a darte un valor.
            //El then indica que hacer despues de que se obtenga esa promesa.
            if (Object.keys(resultDb).length != 0) { //Chequea si la base de datos devuelve algo
                res.status(400).send({ response: "ERROR", message: "Cliente ya existe" });
                return;
            } else { //Sino dice le da la fecha de creacion con este codigo, que seria hoy
                var hoy = new Date();
                var dd = String(hoy.getDate()).padStart(2, '0'); //Ejemplo: 5 = 05. 15 = 15. pone un 0 hasta tener 2 digitos.
                var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = hoy.getFullYear();
                hoy = dd + '/' + mm + '/' + yyyy; //Se pone que hoy es, bueno, hoy.

                const newCliente = { //Se define al nuevo cliente
                    //crypto tiene una funcion para generar ids al azar.
                    id: crypto.randomUUID(),  //se añado la funcion para generar id randomico
                    nombre: nombre,
                    password: password,
                    contacto: contacto, //Contacto era el id, lo cual estaba mal puesto.
                    activo: true,
                    registrado: true,
                    primer_ingreso: false,
                    fecha_alta: hoy,
                    fecha_cambio_password: hoy,
                    fecha_ultimo_ingreso: hoy,
                };

                const paramsPut = { //Aca en vez de buscar en la tabla cliente, lo que va ha hacer es insertar el nuevo en esa tabla.
                    TableName: "cliente",
                    Item: newCliente,
                    ConditionExpression: 'attribute_not_exists(id)', //Solo lo inserta si no existe un cliente con ese id.
                };

                docClient.put(paramsPut, function (err, data) {
                    if (err) {
                        res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB error" + err }));
                    } else {
                        res.status(200).send(JSON.stringify({ response: "OK", "cliente": newCliente }));
                    }
                });
            }
        });

});
/*----------
/api/updateCliente
Permite actualizar datos del cliente contacto, nombre, estado de activo y registrado
*/
app.post('/api/updateCliente', (req, res) => {

    const { id } = req.body; //El body pide los datos de un json, como puede ser un post
    const { nombre } = req.body; //A diferencia de un req.param, que es de la URL misma.
    const { password } = req.body;
    const { contacto } = req.body; //Se añadio pq si no, no se puede cambiar el mail
    // "activo":"true"
    // "registrado":"true"

    var activo = ((req.body.activo + '').toLowerCase() === 'true') //Convierte los datos a string
    var registrado = ((req.body.registrado + '').toLowerCase() === 'true') //=== true compara si es true el valor, sino devuelve false.

    console.log("updateCliente: id(" + id + ") nombre(" + nombre + ") password(" + password + ") activo(" + activo + ") registrado(" + registrado + ") contacto(" + contacto + ")");
    //Se añadio que muestre el contacto tambien
    if (!id) {
        res.status(400).send({ response: "ERROR", message: "Id no informada" });
        return;
    }

    if (!nombre) {
        res.status(400).send({ response: "ERROR", message: "Nombre no informado" });
        return;
    }

    if (!password) {
        res.status(400).send({ response: "ERROR", message: "Password no informado" });
        return;
    }

    var params = {
        TableName: "cliente",
        Key: {
            "id": id
            //test use "id": "0533a95d-7eef-4c6b-b753-1a41c9d1fbd0"   
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + null }));
            return;
        } else {

            if (Object.keys(data).length == 0) {
                res.status(400).send(JSON.stringify({ "response": "ERROR", message: "Cliente no existe" }), null, 2);
                return;
            } else {

                const paramsUpdate = { //define todos los parámetros necesarios para ejecutar un update en DynamoDB.

                    ExpressionAttributeNames: { //Define alias para los nombres de los atributos.
                        "#a": "activo", //#a == activo. Porque pueden ser palabras reservadas o solo hacerlo mas simple.
                        "#n": "nombre",
                        "#p": "password",
                        "#r": "registrado",
                        "#c": "contacto" //se añadio el alias de contacto

                    },
                    ExpressionAttributeValues: { //Define los valores que se van a asignar en la actualización.
                        ":a": activo,
                        ":p": password,
                        ":n": nombre,
                        ":r": registrado,
                        ":c": contacto //se añadio el atributo de contacto
                    },
                    Key: {
                        "id": id
                    },
                    ReturnValues: "ALL_NEW",
                    TableName: "cliente",
                    UpdateExpression: "SET #n = :n, #p = :p, #a = :a, #r = :r, #c = :c" //Es la “instrucción” que DynamoDB ejecuta.
                    //En este caso, está actualizando varios campos a la vez.
                }; //se añadio el set de contacto, porque si no, no se puede cambiar.
                docClient.update(paramsUpdate, function (err, data) {
                    if (err) {
                        res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + err }));
                        return;
                    } else {
                        res.status(200).send(JSON.stringify({ response: "OK", message: "updated", "data": data }));
                    }
                });
            }
        }
    })


});
/*-------
/api/resetCliente
Permite cambiar la password de un cliente
*/
app.post('/api/resetCliente', async (req, res) => { //se usa para declarar una función asíncrona, osea, una función que puede ejecutar operaciones que toman tiempo
    const { contacto, password } = req.body;

    if (!contacto) {
        res.status(400).send({ response: "ERROR", message: "Contacto no informado" });
        return;
    }

    if (!password) {
        res.status(400).send({ response: "ERROR", message: "Password no informada" });
        return;
    }

    try {
        // Buscar el cliente por contacto
        const resultados = await scanDb(contacto); //El scandb busca al cliente a partir de su contacto dentro de la data base
        if (!resultados || resultados.length === 0) { //Si no encuentra el cliente
            res.status(400).send({ response: "ERROR", message: "Cliente no encontrado" });
            return;
        }

        const id = resultados[0].id; //Al igual que el login por mail, el database solo acepta ids, asi que a partir del mail de la persona, solo se agarra su id para continuar con el proceso

        // Preparar actualización
        const paramsUpdate = {                               // Se crea un objeto de configuración para la operación "update" de DynamoDB
            TableName: "cliente",                            // Nombre de la tabla en la base de datos donde se hará la actualización
            Key: { id },                                     // Identifica el registro que se va a modificar usando su clave primaria "id"
            UpdateExpression: "SET #p = :p",                 // Indica qué campo se va a actualizar (en este caso, el alias "#p") y con qué valor (":p")
            ExpressionAttributeNames: { "#p": "password" },  // Define el alias "#p" como referencia al atributo real "password" en la tabla
            ExpressionAttributeValues: { ":p": password },   // Asigna el valor que reemplazará al campo "password" (el valor viene del body del request)
            ReturnValues: "ALL_NEW"                          // Pide que DynamoDB devuelva el item completo. después de la actualización. Osea cliente
        };  //Dato: En JavaScript, el orden de las propiedades en un objeto no afecta su funcionalidad
        //Aunque el set se defina antes del alias y los valores, anda igual
        //Es como si tuviera una receta donde dice "Usa ingredientes A y B". Y los ingredientes esta abajo de esa consigna.

        //Ejecutar el update
        docClient.update(paramsUpdate, function (err, data) { //El paramsupdate definido arriba
            if (err) {
                res.status(400).send({ response: "ERROR", message: "DB access error: " + err });
            } else {
                res.status(200).send({ response: "OK", message: "Contraseña actualizada", data });
            }
        });
    } catch (error) {
        console.error("Error en resetCliente:", error);
        res.status(500).send({ response: "ERROR", message: "Error interno del servidor" });
    }
});

/*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*
/*                                                       API REST ticket                                                             *
/*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*/

/*---------
Función para realizar el SCAN de un DB de cliente usando contacto como clave para la búsqueda (no es clave formal del DB)
*/ //El comentario arriba esta mal, en realidad, busca un ticket por el id de un cliente.
async function scanDbTicket(clienteID) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    const scanKey = clienteID;
    const paramsScan = { // ScanInput
        TableName: "ticket", // La tabla de ticket
        Select: "ALL_ATTRIBUTES" || "ALL_PROJECTED_ATTRIBUTES" || "SPECIFIC_ATTRIBUTES" || "COUNT", //All atributes devuelve la primera cadena no vacia
        FilterExpression: 'clienteID = :clienteID', //Filtrara y buscara por el id de cliente
        ExpressionAttributeValues: { ':clienteID': scanKey } //Le pasa el atributo dado en scankey, como el filtro
    };
    var objectPromise = await docClient.scan(paramsScan).promise().then((data) => {
        return data.Items
    });
    return objectPromise;
}
/*----------
  listarTicket
  API REST para obtener todos los tickets de un clienteID. Aca se aplica el SCANDBTicket de alla arriba
*/
app.post('/api/listarTicket', (req, res) => { //Aca lista todos los tickets de un cliente por su id
    //Usa una función (scanDbTicket) que hace un scan filtrando por clienteID
    const { ID } = req.body;
    console.log("listarTicket: ID(" + ID + ")");

    if (!ID) {
        res.status(400).send({ response: "ERROR", message: "ID cliente  no informada" });
        return;
    }

    scanDbTicket(ID)
        .then(resultDb => {
            if (Object.keys(resultDb).length == 0) {
                res.status(400).send({ response: "ERROR", message: "clienteID no tiene tickets" });
                return;
            } else {
                res.status(200).send(JSON.stringify({ response: "OK", "data": resultDb }));
            }

        });

});

/*---------
  getTicket
  API REST para obtener los detalles de un ticket
*/
app.post('/api/getTicket', (req, res) => { //Este muestra un ticket en especifico con todos sus datos.
    const { id } = req.body;
    console.log("getTicket: id(" + id + ")");

    if (!id) {
        res.status(400).send({ response: "ERROR", message: "ticket id no informada" });
        return;
    }
    var params = {
        TableName: "ticket",
        Key: {
            "id": id
            //"clienteID": "0533a95d-7eef-4c6b-b753-1a41c9d1fbd0".
            //"id"       : "e08905a8-4aab-45bf-9948-4ba2b8602ced"
        }
    };
    docClient.get(params, function (err, data) { //busca un solo ítem que tenga exactamente ese id como clave primaria.
        if (err) {
            res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + err }));
        }
        else {
            if (Object.keys(data).length == 0) {
                res.status(400).send({ response: "ERROR", message: "ticket invalido" });
            } else {
                res.status(200).send(JSON.stringify({ response: "OK", "data": data }));
            }
        }
    })
});

/*-----------------
/api/addTicket
API REST para agregar ticket (genera id)
*/
app.post('/api/addTicket', (req, res) => {

    const { clienteID } = req.body;
    const estado_solucion = 1; //El estado ya esta dado por defecto como uno. NO TOCAR PORQUE ANDA
    const { solucion } = req.body;
    const { descripcion } = req.body;

    var hoy = new Date(); //Lo mismo del addcliente donde pone la fecha de hoy
    var dd = String(hoy.getDate()).padStart(2, '0');
    var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = hoy.getFullYear();
    hoy = dd + '/' + mm + '/' + yyyy;

    const newTicket = { //Crea el nuevo ticket
        id: crypto.randomUUID(),
        clienteID: clienteID,
        estado_solucion: estado_solucion,
        solucion: solucion,
        descripcion: descripcion,
        fecha_apertura: hoy,
        ultimo_contacto: hoy
    };

    const paramsPut = { //Aca chequea que el id exista para crear el ticket
        TableName: "ticket",
        Item: newTicket,
        ConditionExpression: 'attribute_not_exists(id)',
    };

    docClient.put(paramsPut, function (err, data) { //Crea el ticket en si.
        if (err) {
            res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB error" + err }));
        } else {
            res.status(200).send(JSON.stringify({ response: "OK", "ticket": newTicket }));
        }
    });
}
)

/*--------
/api/updateTicket
Dado un id actualiza el ticket, debe informarse la totalidad del ticket excepto ultimo_contacto
*/
app.post('/api/updateTicket', (req, res) => {

    const { id } = req.body;
    const { clienteID } = req.body;
    const { estado_solucion } = req.body;
    const { solucion } = req.body;
    const { descripcion } = req.body;
    const { fecha_apertura } = req.body;

    if (!id) {
        res.status(400).send({ response: "ERROR", message: "Id no informada" });
        return;
    }

    if (!clienteID) {
        res.status(400).send({ response: "ERROR", message: "clienteID no informada" });
        return;
    }

    if (!estado_solucion) {
        res.status(400).send({ response: "ERROR", message: "estado_solucion no informada" });
        return;
    }

    if (!solucion) {
        res.status(400).send({ response: "ERROR", message: "solucion no informado" });
        return;
    }

    if (!fecha_apertura) {
        res.status(400).send({ response: "ERROR", message: "fecha apertura" });
        return;
    }

    var hoy = new Date();
    var dd = String(hoy.getDate()).padStart(2, '0');
    var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = hoy.getFullYear();
    hoy = dd + '/' + mm + '/' + yyyy;

    const ultimo_contacto = hoy;

    var params = {
        TableName: "ticket",
        Key: {
            "id": id
            //test use "id": "0533a95d-7eef-4c6b-b753-1a41c9d1fbd0"   
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + null }));
            return;
        } else {

            if (Object.keys(data).length == 0) {
                res.status(400).send(JSON.stringify({ "response": "ERROR", message: "ticket no existe" }), null, 2);
                return;
            } else {

                const paramsUpdate = {

                    ExpressionAttributeNames: { //Asigna alias
                        "#c": "clienteID",
                        "#e": "estado_solucion",
                        "#s": "solucion",
                        "#a": "fecha_apertura",
                        "#u": "ultimo_contacto",
                        "#d": "descripcion"
                    },
                    ExpressionAttributeValues: { //Asigna atributos
                        ":c": clienteID,
                        ":e": estado_solucion,
                        ":s": solucion,
                        ":a": fecha_apertura,
                        ":u": ultimo_contacto,
                        ":d": descripcion
                    },
                    Key: {
                        "id": id //Busca por id
                    },
                    ReturnValues: "ALL_NEW", //Devuelve todos los datos nuevos
                    TableName: "ticket",
                    UpdateExpression: "SET #c = :c, #e = :e, #a = :a, #s = :s, #d = :d, #u = :u" //Define la actualizacion con alias y atributos
                };
                docClient.update(paramsUpdate, function (err, data) { //Hace la actualizacion con lo definido antes
                    if (err) {
                        res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + err }));
                        return;
                    } else {
                        res.status(200).send(JSON.stringify({ response: "OK", "data": data }));
                    }
                });
            }
        }
    })

});
/*-------------------------------------------------[ Fin del API REST ]-------------------------------------------------------------*/
