
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

import express from 'express';
import crypto from 'crypto';
console.log("Comenzando servidor");

// const crypto = require('crypto');
console.log("crypto Ok!");

//const express = require('express');
//console.log("express Ok!");

const app = express();
console.log("express ready!");

const PORT = 8080;

import cors from 'cors';

//const cors = require('cors');
console.log("cors ok!");

app.use(cors());
console.log("CORS ready!");

import AWS from 'aws-sdk'
//var AWS = require('aws-sdk');
console.log("aws-sdk ready!");

/*----
Acquire critical security resources from an external file out of the path
*/

//const accessKeyId = require('../accessKeyId.js');
//const secretAccessKey = require('../secretAccessKey.js');

import accessKeyId from '../accessKeyId.js';
import secretAccessKey from '../secretAccessKey.js';

let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey
};

AWS.config.update(awsConfig);
console.log("Servidor listo!");
let docClient = new AWS.DynamoDB.DocumentClient();

/*----
   Application server in LISTEN mode
*/

app.listen(
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
function jsonParser(keyValue, stringValue) {
    var string = JSON.stringify(stringValue);
    var objectValue = JSON.parse(string);
    return objectValue[keyValue];
}

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

    const { contacto } = req.body; //“Creá dos variables llamadas contacto y password y asignales los valores de las propiedades contacto y password del objeto body”.
    const { password } = req.body; //El request es una funcion del express.js, que es basicamente le hace un pedido a la database
    const resultados = await scanDb(contacto); //Con el mail se busca los datos del cliente, y se usa un await para esperar que termine la funcion.

    if (!resultados || resultados.length == 0) { //corrobora que devuelva un resultado
        res.status(400).send({ response: "ERROR", menssage: "Cliente no encontrado" });
        return;
    }
    console.log("resultados=" + JSON.stringify(resultados)) //convierte a json el resultado

    console.log("loginCliente: contacto(" + contacto + ") password (" + password + ")");

    if (!password) {
        res.status(400).send({ response: "ERROR", message: "Password no informada" });
        return;
    }
    if (!contacto) {
        res.status(400).send({ response: "ERROR", message: "Contacto no informado" });
        return;
    }
    const cliente = resultados[0]; //Aca busca en la posicion 0 donde estan los datos del cliente
    const id = cliente.id; //Y aca devuelve el id del cliente que se obtuvo a partir del mail.

    let getClienteByKey = function () {
        var params = {
            TableName: "cliente",
            Key: {
                "id": id //Utiliza el id obtenido para poder identificar que cliente es
            }
        };
        docClient.get(params, function (err, data) {
            if (err) {
                res.status(400).send(JSON.stringify({ response: "ERROR", message: "DB access error " + err }));
            }
            else {
                if (Object.keys(data).length == 0) {
                    res.status(400).send({ response: "ERROR", message: "Cliente invalido" });
                } else {
                    const paswd = jsonParser('password', data.Item);
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

app.post('/api/getCliente/:id', (req, res) => {
    const { id } = req.params;
    console.log("getCliente: id(" + id + ")");
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
async function scanDb(contacto) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    const scanKey = contacto;
    const paramsScan = { // ScanInput
        TableName: "cliente", // required
        Select: "ALL_ATTRIBUTES" || "ALL_PROJECTED_ATTRIBUTES" || "SPECIFIC_ATTRIBUTES" || "COUNT",
        FilterExpression: 'contacto = :contacto',
        ExpressionAttributeValues: { ':contacto': scanKey }
    };
    var objectPromise = await docClient.scan(paramsScan).promise().then((data) => {
        return data.Items
    });
    return objectPromise;
}

/*----
addCliente
Revisa si el contacto (e-mail) existe y en caso que no da de alta el cliente generando un id al azar
*/
app.post('/api/addCliente', (req, res) => {

    const { contacto } = req.body;
    const { password } = req.body;
    const { nombre } = req.body;
    console.log("addCliente: contacto(" + contacto + ") nombre(" + nombre + ") password(" + password + ")");

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

    scanDb(contacto)
        .then(resultDb => {
            if (Object.keys(resultDb).length != 0) {
                res.status(400).send({ response: "ERROR", message: "Cliente ya existe" });
                return;
            } else {
                var hoy = new Date();
                var dd = String(hoy.getDate()).padStart(2, '0');
                var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = hoy.getFullYear();
                hoy = dd + '/' + mm + '/' + yyyy;

                const newCliente = {
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

                const paramsPut = {
                    TableName: "cliente",
                    Item: newCliente,
                    ConditionExpression: 'attribute_not_exists(id)',
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

    const { id } = req.body;
    const { nombre } = req.body;
    const { password } = req.body;
    // "activo":"true"
    // "registrado":"true"

    var activo = ((req.body.activo + '').toLowerCase() === 'true')
    var registrado = ((req.body.registrado + '').toLowerCase() === 'true')

    console.log("updateCliente: id(" + id + ") nombre(" + nombre + ") password(" + password + ") activo(" + activo + ") registrado(" + registrado + ")");

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

                const paramsUpdate = {

                    ExpressionAttributeNames: {
                        "#a": "activo",
                        "#n": "nombre",
                        "#p": "password",
                        "#r": "registrado"

                    },
                    ExpressionAttributeValues: {
                        ":a": activo,
                        ":p": password,
                        ":n": nombre,
                        ":r": registrado
                    },
                    Key: {
                        "id": id
                    },
                    ReturnValues: "ALL_NEW",
                    TableName: "cliente",
                    UpdateExpression: "SET #n = :n, #p = :p, #a = :a, #r = :r"
                };
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
            ReturnValues: "ALL_NEW"                          // Pide que DynamoDB devuelva todos los valores del registro después de la actualización
        };


        //Ejecutar el update
        docClient.update(paramsUpdate, function (err, data) {
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
*/
async function scanDbTicket(clienteID) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    const scanKey = clienteID;
    const paramsScan = { // ScanInput
        TableName: "ticket", // required
        Select: "ALL_ATTRIBUTES" || "ALL_PROJECTED_ATTRIBUTES" || "SPECIFIC_ATTRIBUTES" || "COUNT",
        FilterExpression: 'clienteID = :clienteID',
        ExpressionAttributeValues: { ':clienteID': scanKey }
    };
    var objectPromise = await docClient.scan(paramsScan).promise().then((data) => {
        return data.Items
    });
    return objectPromise;
}
/*----------
  listarTicket
  API REST para obtener todos los tickets de un clienteID
*/
app.post('/api/listarTicket', (req, res) => {

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
app.post('/api/getTicket', (req, res) => {
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
            //"clienteID": "0533a95d-7eef-4c6b-b753-1a41c9d1fbd0"   
            //"id"       : "e08905a8-4aab-45bf-9948-4ba2b8602ced"
        }
    };
    docClient.get(params, function (err, data) {
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
    const estado_solucion = 1;
    const { solucion } = req.body;
    const { descripcion } = req.body;

    var hoy = new Date();
    var dd = String(hoy.getDate()).padStart(2, '0');
    var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = hoy.getFullYear();
    hoy = dd + '/' + mm + '/' + yyyy;

    const newTicket = {
        id: crypto.randomUUID(),
        clienteID: clienteID,
        estado_solucion: estado_solucion,
        solucion: solucion,
        descripcion: descripcion,
        fecha_apertura: hoy,
        ultimo_contacto: hoy
    };

    const paramsPut = {
        TableName: "ticket",
        Item: newTicket,
        ConditionExpression: 'attribute_not_exists(id)',
    };

    docClient.put(paramsPut, function (err, data) {
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

                    ExpressionAttributeNames: {
                        "#c": "clienteID",
                        "#e": "estado_solucion",
                        "#s": "solucion",
                        "#a": "fecha_apertura",
                        "#u": "ultimo_contacto",
                        "#d": "descripcion"
                    },
                    ExpressionAttributeValues: {
                        ":c": clienteID,
                        ":e": estado_solucion,
                        ":s": solucion,
                        ":a": fecha_apertura,
                        ":u": ultimo_contacto,
                        ":d": descripcion
                    },
                    Key: {
                        "id": id
                    },
                    ReturnValues: "ALL_NEW",
                    TableName: "ticket",
                    UpdateExpression: "SET #c = :c, #e = :e, #a = :a, #s = :s, #d = :d, #u = :u"
                };
                docClient.update(paramsUpdate, function (err, data) {
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
