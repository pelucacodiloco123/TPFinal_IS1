
/*---
Función para procesar los parámetros recibidos en el URL
*/
function getQueryParams(qs) { //Todo que va despues de la ? en la URL es un queryparam. Aca lo que hace es agarrarlos
    qs = qs.split('+').join(' '); //Remplaza las + por espacios, pq asi se escribe en URL.

    var params = {}, //Aca se guardara la clave-valor
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g; //[^=]+ es el nombre del parámetro (todo lo que no sea =).
                                      //([^&]*) es el valor del parámetro (todo lo que no sea &).

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]); //tokens[1] = nombre del parámetro
                                                                               //okens[2] = valor del parámetro
                                                                               //decodeURIComponent()
    }

    return params;
}

/*---
Extrae del URL el id de cliente ya validado, su nombre y la última fecha de login, actualiza banner de seguridad
*/

console.log("Comienza listarTicket.js");

var query = getQueryParams(document.location.search); //Busca la locacion de la pagina donde estas parado actualmente
console.log("id:"+query.id);
console.log("nombre:"+query.nombre); /*Aca se modificaron los datos que se ven al mostrar ticket*/
console.log("contacto:"+query.contacto); //Estos son logs
console.log("ultima_fecha:"+query.fecha_ultimo_ingreso);
console.log("mode:"+query.mode);

//Esto de aca es el texto que se muestra arriba de la tablita del ticket
document.getElementById("lastlogin").innerHTML = "<table><tr><td>Cliente</td><td>"+query.id+"</td></tr><tr><td>Nombre</td><td>"+query.nombre+"</td></tr><tr><td>Contacto</td><td>"+query.contacto+"</td></tr></tr><tr><td>Ultimo ingreso</td><td>"+query.fecha_ultimo_ingreso+"</td></tr></table>";
/*Aca se modificaron los datos para ver que muestra en el listar ticket*/
//InnerHTML es para que se muestre dinamicamente, pq si no, no podrias mostrar mas tickets de los que hay definidos en el html
//Esta parte busca el que tenga el id de lastlogin
const systemURL={ 

    listarTicket    : "http://127.0.0.1:5500/HTML/listarTicket.html",
    loginCliente    : "http://127.0.0.1:5500/HTML/loginClient.html",

};

const RESTAPI={
    loginCliente    : "http://127.0.0.1:8080/api/loginCliente",
    listarTicket    : "http://localhost:8080/api/listarTicket",
};

/*---
Define que REST API server utilizará para obtener datos, el modo lo recibe como argumento
LOCAL 
TYPICODE
AWS 

*/

const HTMLResponse=document.querySelector("#app"); //Busca quien tiene el id app y lo almacena en HTMLResponse
var ticket = {
    "ID" : query.id, //Le pasa que el id definido en el query aca
};
    
var options = {
    method: 'GET', //Options generalizado que despues se sobreescribe dependiendo el modo en el que este
    };
var APIREST_URL='';
console.log('transferred mode:'+query.mode);    

switch (query.mode) { //Hace de forma distinta segun el modo en el que este
  case "LOCAL":
    console.log("Utiliza servidor NodeJS local.");
    console.log("API_listarTicket:"+RESTAPI.listarTicket); 
  
    ticket = {
       "ID" : query.id,
    };

    options = {
       method: 'POST',
       headers: {
       'Content-Type': 'application/json',
    },
        body: JSON.stringify(ticket),
    };
    console.log("ticket:"+JSON.stringify(ticket)+" options:"+JSON.stringify(options));

    APIREST_URL=RESTAPI.listarTicket;
    break;
  case "TYPICODE":
    console.log("Typicode no soportado en ésta función");
    APIREST_URL='https://my-json-server.typicode.com/lu7did/mesaayuda/posts/'+query.id;
    break;
  case "AWS": // Múltiples casos para la misma acción
    console.log("Utiliza AWS como serverless");
    APIREST_URL='https://n3ttz410ze.execute-api.us-east-1.amazonaws.com/default/listTicketGET?ID='+query.id;
    //clientID 803a62c8-78c8-4b63-9106-73af216d504b
    break;
  default: // Si no coincide con ninguno de los casos anteriores
    console.log("Asume AWS.");
    APIREST_URL='https://n3ttz410ze.execute-api.us-east-1.amazonaws.com/default/listTicketGET?ID='+query.id;
}
console.log("APIREST_URL:"+APIREST_URL);
console.log("ticket  :"+JSON.stringify(ticket));
console.log("options :"+JSON.stringify(options));

fetch(`${APIREST_URL}`,options)
.then(res => {
    return res.json();
}).then(ticket => {
    console.log("ticket:");
    console.log(ticket);
    let f = false;
    let table = document.createElement("table");
    table.style.border = "1px solid";
    table.style.backgroundColor = "#626607";
    
    // Verificar si hay datos y son del cliente correcto
    if (ticket.data && ticket.data.length > 0) {
        ticket.data.forEach((t) => { 
            console.log(t.clienteID);
            if (t.clienteID == query.id) {
                if (f == false) {
                    f = true;
                    const hdr = ["ClienteID","TicketID","Motivo", "Solucion", "Estado","Fecha"];
                    let tr = document.createElement("tr");
                    tr.style.border = "1px solid";
                    hdr.forEach((item) => {
                        let th = document.createElement("th");
                        th.style.border = "1px solid";
                        th.innerText = item;
                        tr.appendChild(th);
                    });
                    table.appendChild(tr);
                }
                
                const body = [t.clienteID, `${t.id}`, `${t.descripcion}`, `${t.solucion}`, `${t.estado_solucion}`, `${t.ultimo_contacto}`];
                let trl = document.createElement("tr");
                body.forEach((line) => {
                    let td = document.createElement("td");
                    td.style.border = "1px solid";
                    td.innerText = line;
                    trl.appendChild(td);
                });
                table.appendChild(trl);
            }
        });
    }
    
    // Mostrar tabla o mensaje de error
    if (f) {
        console.log(table);
        HTMLResponse.appendChild(table);
    } else {
        console.log("no tiene tickets");
        document.getElementById('mensajes').style.textAlign = "center";
        document.getElementById('mensajes').style.color = "RED";
        document.getElementById("mensajes").innerHTML = "No hay tickets pendientes";
    }
});
