class visorPDF {


    constructor(rutaPDF, visor) {
        this.rutaPDF = rutaPDF;
        this.visor = visor;
        this.loaded = false;
        this.hideToolbar;
        this.crearVisor().then(() => {
            this.iniciarVisor();
        })

        this.visor.style.overflow = "hidden";
    }

    crearVisor() {
        if (!this.visor) throw "No existe el elemento utilizado como visor.";

        const creationPromise = new Promise((resolve, reject) => {

            fetch("visorPDF.html", {
                method: "GET",
                headers: {
                    "Content-Type": "text/html"
                }
            }).then(r => r.text())
                .then(view => {

                    this.visor.innerHTML = view;
                    resolve(true)

                }).catch(error => console.error("ERROR EN VISOR PDF:: ", error))

        })

        return creationPromise;

    }

    iniciarVisor() {

        pdfjsLib.getDocument(this.rutaPDF).promise.then(doc => {

            this.doc = doc;
            this.paginas = this.doc._pdfInfo.numPages;
            this.pagActual = 1;

            this.visor.querySelector(".pag-actual span").innerText = this.paginas;

            this.obtenerK().then(res => {

                this.ajustarZoom();
                this.render().then(x => {

                    this.ajustarCanvas();
                    this.agregarEventos();
                    this.loaded = true;
                });
            });

        });
    }

    obtenerK() {
        var promesaK = new Promise((resolve, reject) => {
            this.doc.getPage(1).then(page => {

                var viewport = page.getViewport({ scale: 0.3 });
                var alto = viewport.height;
                var ancho = viewport.width;

                if (alto > ancho) {//pagina vertical
                    this.k = 59.496;
                } else {
                    this.k = 84.192;
                }

                resolve(true);

            });
        });

        return promesaK;
    }

    calcularZoom(width) {

        //59.496 constante entre cada 0.1 de zoom VERTICAL
        //84.192 constante entre cada 0.1 de zoom HORIZONTAL

        var zoom = width / (this.k * 10);
        return parseFloat(zoom);
    }


    ajustarZoom() {

        //se modificó para este proyecto, valor anterior * 0.9
        var cont_width = this.visor.clientWidth * 1.05;
        var zoom = this.calcularZoom(cont_width);

        this.zoom = zoom;
        this.defaultZoom = zoom;
        this.porcentajeZoom = 100;
        this.altoVisor();


    }

    altoVisor() {
        this.doc.getPage(this.pagActual).then(page => {

            var viewport = page.getViewport({ scale: parseFloat(this.defaultZoom) });
            var alto = viewport.height + 20;

            //esta linea se modificó para este proyecto, antiguamente era maxHeight
            this.visor.style.height = alto + "px";

        });
    }

    render() {
        var promesa = new Promise((resolve, reject) => {
            this.doc.getPage(this.pagActual).then(page => {



                var myCanvas = this.visor.querySelector("canvas");
                var context = myCanvas.getContext("2d");

                var viewport = page.getViewport({ scale: parseFloat(this.zoom) });//1.3  w:810  ,  2  w:96%   margin:2%
                myCanvas.width = viewport.width;
                myCanvas.height = viewport.height;

                page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise.then(function () {
                    resolve("finished")
                });

            });

        });
        return promesa;
    }

    ajustarCanvas() {

        if (this.porcentajeZoom != 100) {
            this.visor.querySelector(".visor").style.width = "auto";
            this.visor.querySelector("canvas").style.width = "auto";
        } else {

            var diferencia = (this.defaultZoom * 0.10) * this.k * 10;  //diferencia entre cada aumento
            var wVisor = this.visor.clientWidth;
            var wCanvas = this.visor.querySelector("canvas").clientWidth;


            if (wCanvas > (wVisor - (diferencia / 2)) && wCanvas < (wVisor + (diferencia / 2))) {

                this.visor.querySelector(".visor").style.width = "100%";
                this.visor.querySelector("canvas").style.width = "100%";
            }
        }

    }

    agregarEventos() {

        //aumentar en 10% el zoom
        this.visor.querySelector(".moreZoom").addEventListener("click", e => {

            if (this.porcentajeZoom < 200) {
                var dz = parseFloat(this.defaultZoom);

                var zoom = parseFloat(this.zoom) + (dz * 0.10);
                this.zoom = zoom;

                var promesa = this.render();

                this.porcentajeZoom = parseFloat(this.porcentajeZoom) + 10;
                this.visor.querySelector(".zoom  input").value = this.porcentajeZoom;

                promesa.then(res => {
                    this.ajustarCanvas();
                });
            }
        });

        //disminuir en 10% el zoom
        this.visor.querySelector(".lessZoom").addEventListener("click", e => {

            if (this.porcentajeZoom > 10) {
                var dz = parseFloat(this.defaultZoom);

                var zoom = parseFloat(this.zoom) - (dz * 0.10);
                this.zoom = zoom;

                var promesa = this.render();

                this.porcentajeZoom = parseFloat(this.porcentajeZoom) - 10;
                this.visor.querySelector(".zoom  input").value = this.porcentajeZoom;

                promesa.then(res => {
                    this.ajustarCanvas();
                });
            }
        });

        //cambiar numero de la pagina
        function actualizarNumero(object) {
            try {
                let pag = object.pagActual;
                if (pag < 10) {
                    object.visor.querySelector(".pag-actual input").value = "0" + pag;
                } else {
                    object.visor.querySelector(".pag-actual input").value = pag;
                }
            } catch (ex) { }
        }

        //cambiar a página anterior
        this.visor.querySelector(".ant").addEventListener("click", e => {

            if (this.pagActual > 1) {
                this.pagActual = parseInt(this.pagActual) - 1;
                this.render();
                actualizarNumero(this);

            }
        });

        //cambiar a página siguiente
        this.visor.querySelector(".sig").addEventListener("click", e => {

            if (this.pagActual < this.paginas) {
                this.pagActual = parseInt(this.pagActual) + 1;
                this.render();
                actualizarNumero(this);

            }
        });

        /*----- APARECER Y DESAPARECER TOOLBAR -----*/

        let llaveTiempo = true;
        function time(object) {
            try {
                if (llaveTiempo) {
                    object.hideToolbar = setTimeout(() => {

                        $(object.visor.querySelector(".tools-pdf > div")).animate({ marginTop: "-100%" });

                    }, 2000)
                }


            } catch (ex) {
            }
        }

        time(this);

        this.visor.querySelector(".tools-pdf").addEventListener("mouseenter", e => {

            $(this.visor.querySelector(".tools-pdf > div")).animate({ marginTop: "0" });
            clearTimeout(this.hideToolbar);
        });

        this.visor.querySelector(".tools-pdf").addEventListener("mouseleave", e => {

            time(this);
        });

        //pausar el timeour al hacer focus en input
        this.visor.querySelector(".pag-actual input").addEventListener("focus", e => {

            llaveTiempo = false;
        });

        //colocar de nuevo el time para ocultar toolbar y CAMBIAR DE PAGINA
        this.visor.querySelector(".pag-actual input").addEventListener("blur", e => {

            llaveTiempo = true;
            time(this);

            //cambiar de pagina al perder el foco
            var txt = e.currentTarget.value;

            if (!isNaN(txt) && txt > 0 && txt <= this.paginas) {
                this.pagActual = parseInt(txt);
                this.render();
            } else {
                actualizarNumero(this);
            }
        });

        //quitando foco al presionar enter
        this.visor.querySelector(".pag-actual input").addEventListener("keyup", e => {

            if (e.keyCode == 13) {
                e.currentTarget.blur();
            }
        });

        //redimensionar el visor
        var llave = true;
        window.addEventListener("resize", e => {

            if (llave && this.loaded) {
                llave = false;
                this.ajustarZoom();
                this.render();
                this.visor.querySelector(".zoom input").value = 100;

                setTimeout(function () {

                    llave = true;
                }, 500);
            }

        });

    }
}