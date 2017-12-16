// creación de las rutas
var nextId = 1;
function Ruta(titulo) {
    this.id = nextId++;
    this.ts = Date.now();
    this.titulo = titulo;
    this.posiciones = [];
    this.color = '#000000';
    this.visible = 'on';
}

// las tareas se almacenan en una array JS
// rutinas para manipular la base de datos
var rutas = [];
/* crea una nueva ruta en la bd */
function nuevaRuta(route) {
    console.log('nuevaRuta(' + JSON.stringify(ruta) + ')');
    rutas.unshift(ruta);
    return ruta;
}
/* busca una ruta en la bd */
function buscarRuta(id) {
    console.log('buscarRuta(' + id + ')');
    for (var i = 0; i < rutas.length; i++) {
        if (rutas[i].id == id) return rutas[i];
    }
    return null;
}
/* devuelve el número de rutas */
function contarRutas() {
    console.log('contarRutas()');
    return rutas.length;
}
/* itera entre todas las rutas */
function iterarRutas(cb) {
    console.log('iterarRutas()');
    for (var i in rutas) {
        cb(rutas[i]);
    }
}
/* elimina una ruta de la bd */
function eliminarRuta(id) {
    console.log('eliminarRuta(' + id + ')');
    for (var i = 0; i < rutas.length; i++) {
        if (rutas[i].id == id) {
            rutas.splice(i, 1);
            return;
        }
    }
}