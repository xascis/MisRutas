// 6 controlador

// 6.1 variables
// tiempo entre lecturas de GPS
var GPS_GRAB_TIME = 2000;
// timers
var timerReloj, timerGPS;
// grabar ruta
var grabando, contadorReloj, rutaEnCurso;
// mapa
var mapa;

// id de la ruta
var id_ruta;

// 6.2 inicializacion
function inicializarHome() {
    console.log('inicializarHome()');
    // - inicializar variables
    grabando = false;
    timerReloj = null;
    timerGps = null;
    contadorReloj = null;
    // - registrar manejadores
    $('#btGrabar').click(function (ev) {
        if (grabando) {
            console.log('pararRuta(' + rutaEnCurso.id + ')');
            grabando = false;
            // parar timers
            clearInterval(timerReloj);
            clearInterval(timerGps);
            // guardar ruta
            rutas.push(rutaEnCurso);
            // limpiar ruta
            rutaEnCurso = null;
            // refrescar página
            refrescarHome();
        } else {
            rutaEnCurso = new Ruta();
            console.log('empezarRuta(' + rutaEnCurso.id + ')');
            // recuperar título de la ruta
            var titulo = $('#txtTitulo').val();
            if (!titulo || titulo.length == 0) titulo = "Default";
            rutaEnCurso.titulo = titulo;
            // comenzar grabación de ruta (timers, ...)
            grabando = true;
            contadorReloj = 0;
            timerReloj = setInterval(function () {
            contadorReloj++;
            refrescarHome();
            }, 1000);
            timerGps = setInterval(function () {
                leerGps();
            }, GPS_GRAB_TIME);
            // refrescar página
            refrescarHome();
        }
    });
    // refrescar página
    refrescarHome();
}
function inicializarMisRutas() {
    console.log('inicializarMisRutas()');
    refrescarMisRutas();
}
function inicializarMapa() {
    console.log('inicializarMapa()');
    // crear el mapa la primera vez que se muestra la página
    $(document).one('pageshow', '#pgMapa', function (e, data) {
        // obtener altura del contenedor
        var header = $("#pgMapa").find("div[data-role='header']:visible");
        var footer = $("#pgMapa").find("div[data-role='footer']:visible");
        var content = $("#pgMapa").find("div.ui-content:visible");
        var viewport_height = $(window).height();
        var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
        if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
            content_height -= (content.outerHeight() - content.height());
        }
        $('#pnMapa').height(content_height);
        // crear mapa
        var myOptions = {
            zoom: 18,
            center: new google.maps.LatLng(38.695015, -0.476049),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapa = new google.maps.Map($('#pnMapa')[0], myOptions);
        mapa.polylines = new Array();
        // pintar
        refrescarMapa();
    });
}
// completado por el alumno
function inicializarEditarRuta(){
    console.log('inicializarEditarRuta(' + id_ruta + ')');
    $('#btBorrar').on('click', function(){
        eliminarRuta(id_ruta);
        id_ruta = null;
        self.history.back();
    });
    refrescarEditarRuta();
}

// manejadores para las funciones de inicialización
$(document).one('pagecreate', '#pgHome', function (ev, ui) {
    inicializarHome();
});
$(document).one('pagecreate', '#pgMisRutas', function (ev, ui) {
    inicializarMisRutas();
});
$(document).one('pagecreate', '#pgMapa', function (ev, ui) {
    inicializarMapa();
});
// completar
$(document).one('pagecreate', '#pgEditarRuta', function (ev, ui) {
    inicializarEditarRuta(); // pasar el parametro de la ruta seleccionada ¿?
});

// 6.3 Refresco
function refrescarHome() {
    console.log('refrescarHome()');
    if (grabando) {
        $('#txtTitulo').val(rutaEnCurso.titulo).textinput('refresh');
        // mostrar panel
        $('#btGrabar').val('Parar').button('refresh');
        $('#lblInfo').text('Guardando ruta' + rutaEnCurso.titulo + '...');
        var minutos = parseInt(contadorReloj / 60);
        var segundos = contadorReloj % 60;
        var horas = parseInt(minutos / 60);
        minutos = minutos % 60;
        $('#lblReloj').text("" + (horas < 10 ? "0" : "") + horas + ":" + (minutos < 10 ? "0" : "") + minutos + ":" + (segundos < 10 ? "0" : "") + segundos);
        $('#pnInfo').css('visibility', 'visible');
    } else {
        // ocultar panel
        $('#btGrabar').val('Empezar ruta').button('refresh');
        $('#pnInfo').css('visibility', 'hidden');
    }
}

function refrescarMisRutas() {
    console.log('refrescarMisRutas()');
    // limpiar
    $('#pnRutas').html('<ul data-role="listview" data-filter="true"></ul>');
    // pintar rutas
    iterarRutas(function (ruta) {
        var str = '<li><a id="' + ruta.id + '" href="#pgEditarRuta">' + ruta.titulo + '</li>';
        $('#pnRutas ul').append(str);
    });
    $('#pnRutas ul').listview();
    $('#pnRutas ul li a').on('click', function(){
        id_ruta = $(this).attr('id');
        console.log(id_ruta);
    });
}

function refrescarMapa() {
    console.log('refrescarMapa()');
    // limpiar todas las rutas pintadas
    for (var i = 0; i < mapa.polylines.length; i++)
    mapa.polylines[i].setMap(null);
    mapa.polylines = [];
    // transformar rutas
    var toPath = function(posiciones) {
        var path = [];
        for (var i= 0; i < posiciones.length; i++){
            path.push(new google.maps.LatLng(posiciones[i].lat, posiciones[i].lng));
        }
        return path;
        };
        iterarRutas(function (ruta) {
        // sólo si son visibles
        if (ruta.visible == 'on') {
            var polyline = new google.maps.Polyline({
            path: toPath(ruta.posiciones),
            map: mapa,
            strokeColor: ruta.color,
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
            // guardar información sobre las rutas pintadas
            mapa.polylines.push(polyline);
        }
    });
}
// completar
function refrescarEditarRuta(){
    console.log('refrescarEditarRuta(' + id_ruta + ')');
    console.log(rutas);
    // limpiar buscar 
    if (!id_ruta) return;
    var ruta = buscarRuta(id_ruta);
    if (!ruta) {
        alert('error, ruta con id' + id_ruta + ' no existe');
        return;
    }
    // detales de la ruta
    $('#txtEditarTitulo').val(ruta.titulo);
    var date = new Date(ruta.ts);
    $('#txtEditarFecha').val([date.getDate(), date.getMonth()+1, date.getFullYear()].join("/"));
    $('#txtEditarColor').val(ruta.color);
    $('#txtEditarVisualizar').val(ruta.visible).flipswitch('refresh');
    // manejadores para guardar los cambios
    $('#txtEditarTitulo').on('change', function(){
        ruta.titulo = $(this).val();
    });
    $('#txtEditarColor').on('change', function(){
        ruta.color = $(this).val();
    });
    $('#txtEditarVisualizar').on('change', function(){
        ruta.visible = $(this).val();
    });
}

// refrescar página al saltar a ella
$(document).on("pagecontainershow", function (ev, ui) {
    console.log("navigate: " + ui.prevPage.attr('id') + '->' + ui.toPage.attr('id'));
    switch (ui.toPage.attr('id')) {
        case 'pgHome':
            refrescarHome();
            break;
        case 'pgMisRutas':
            refrescarMisRutas();
            break;
        case 'pgMapa':
            refrescarMapa();
            break;
        case 'pgEditarRuta':
            refrescarEditarRuta();
            break;
    }
});

// 6.4 lectura del GPS
function leerGps() {
    // init
    window.inc = typeof (inc) == 'undefined' ? 0.00005 : window.inc;
    window.lat = typeof (lat) == 'undefined' ? 38.695015 : window.lat;
    window.lng = typeof (lng) == 'undefined' ? -0.476049 : window.lng;
    window.dir = typeof (dir) == 'undefined' ? Math.floor((Math.random() * 4)) : window.dir; // numbers 0,1,2,3 (0 up, 1 right, 2, down, 3 left)
    // generate direction (randomly)
    // it is more likely to follow the previous direction
    var nuevaDir = Math.floor((Math.random() * 4)); // number 0,1,2,3
    if (nuevaDir != (dir + 2) % 4) dir = nuevaDir;
    switch (dir) {
        case 0: // up
            lat += inc;
            break;
        case 1: // right
            lng += inc;
            break;
        case 2: // down
            lat -= inc;
            break;
        case 3: // left
            lng -= inc;
            break;
        default:
    }
    var pos = { lat: lat, lng: lng };
    // add new position to the route
    rutaEnCurso.posiciones.push(pos);
}