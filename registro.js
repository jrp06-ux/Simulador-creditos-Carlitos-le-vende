/* =====================================================
   REGISTRO DE CRÉDITO
===================================================== */
const API_URL = "https://script.google.com/macros/s/AKfycbzv8gO9rcDXfoN1cPL1mCjoUSDvFRF5-OnhFI-2V26U7DaH9r69KQ8NezyVazFNQ7ml4w/exec";
const $ = (id) => document.getElementById(id);


/* =====================================================
   BOTONES
===================================================== */

const volverBtn = $("volverBtn");
const guardarBtn = $("guardarBtn");


/* =====================================================
   FORMATO MONEDA
===================================================== */

const formatoMoneda = new Intl.NumberFormat(
    "es-CO",
    {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }
);


function moneda(valor) {

    return formatoMoneda.format(
        Math.round(Number(valor) || 0)
    );

}


/* =====================================================
   INICIAR PÁGINA
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarCredito();

        activarEventos();

    }
);


/* =====================================================
   EVENTOS
===================================================== */

function activarEventos() {


    /* =========================
       VOLVER AL SIMULADOR
    ========================= */

    volverBtn?.addEventListener(
        "click",
        volverAlSimulador
    );


    /* =========================
       GUARDAR
    ========================= */

    guardarBtn?.addEventListener(
        "click",
        guardarRegistro
    );

}


/* =====================================================
   VOLVER AL SIMULADOR
===================================================== */

function volverAlSimulador() {

    window.location.href = "./index.html";

}


/* =====================================================
   CARGAR CRÉDITO
===================================================== */

function cargarCredito() {

    const creditoGuardado =
        localStorage.getItem(
            "creditoEnRegistro"
        );


    if (!creditoGuardado) {

        console.warn(
            "No existe un crédito pendiente de registro."
        );

        return;

    }


    try {

        const credito =
            JSON.parse(creditoGuardado);


        window.creditoEnRegistro =
            credito;


        mostrarResumen(credito);


        /*
           Completar automáticamente
           datos que vienen del simulador
        */

        const nombreInput =
            $("nombreCompleto");

        const telefonoInput =
            $("telefono");

        const modeloInput =
            $("modelo");


        if (nombreInput) {

            nombreInput.value =
                credito.cliente || "";

        }


        if (telefonoInput) {

            telefonoInput.value =
                credito.telefono || "";

        }


        if (modeloInput) {

            modeloInput.value =
                credito.equipo || "";

        }


    } catch (error) {

        console.error(
            "Error cargando el crédito:",
            error
        );

    }

}


/* =====================================================
   MOSTRAR RESUMEN
===================================================== */

function mostrarResumen(credito) {


    if ($("resEquipo")) {

        $("resEquipo").textContent =
            credito.equipo || "-";

    }


    if ($("resPrecio")) {

        $("resPrecio").textContent =
            moneda(credito.precio);

    }


    if ($("resInicial")) {

        $("resInicial").textContent =
            moneda(credito.inicial);

    }


    if ($("resFinanciado")) {

        $("resFinanciado").textContent =
            moneda(credito.montoFinanciado);

    }


    if ($("resInteres")) {

        $("resInteres").textContent =
            `${credito.interes || 0}% mensual`;

    }


    if ($("resCuotas")) {

        $("resCuotas").textContent =
            `${credito.cuotas || 0} cuotas cada 15 días`;

    }


    /*
       Valor cuota
    */

    if ($("resValorCuota")) {

        $("resValorCuota").textContent =
            moneda(
                credito.cuotaFinal ||
                credito.cuota ||
                0
            );

    }


    /*
       Protección
    */

    if ($("resProteccion")) {

        if (credito.proteccionActiva) {

            $("resProteccion").textContent =
                "Incluida";

        } else {

            $("resProteccion").textContent =
                "No incluida";

        }

    }


    /*
       Gastos plataforma
    */

    if ($("resPlataforma")) {

        $("resPlataforma").textContent =
            moneda(
                credito.gastosPlataforma || 0
            );

    }


    /*
       Total
    */

    if ($("resTotal")) {

        $("resTotal").textContent =
            moneda(
                credito.totalPagar || 0
            );

    }

}

/* =====================================================
   COMPRIMIR IMAGEN
===================================================== */

function comprimirImagen(
    archivo,
    maxWidth = 1600,
    calidad = 0.75
) {

    return new Promise(
        (resolve, reject) => {

            if (!archivo) {

                resolve(null);

                return;

            }


            const lector =
                new FileReader();


            lector.onload =
                function (evento) {

                    const imagen =
                        new Image();


                    imagen.onload =
                        function () {

                            let ancho =
                                imagen.width;

                            let alto =
                                imagen.height;


                            /*
                               Reducir tamaño si es necesario.
                            */

                            if (
                                ancho >
                                maxWidth
                            ) {

                                const escala =
                                    maxWidth /
                                    ancho;

                                ancho =
                                    maxWidth;

                                alto =
                                    alto *
                                    escala;

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                ancho;

                            canvas.height =
                                alto;


                            const contexto =
                                canvas.getContext(
                                    "2d"
                                );


                            contexto.drawImage(
                                imagen,
                                0,
                                0,
                                ancho,
                                alto
                            );


                            /*
                               Convertir a JPEG.
                            */

                            const dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    calidad
                                );


                            /*
                               Quitar:
                               data:image/jpeg;base64,
                            */

                            const base64 =
                                dataUrl.split(
                                    ","
                                )[1];


                            resolve({

                                data:
                                    base64,

                                type:
                                    "image/jpeg"

                            });

                        };


                    imagen.onerror =
                        function () {

                            reject(
                                new Error(
                                    "No se pudo procesar una imagen."
                                )
                            );

                        };


                    imagen.src =
                        evento.target.result;

                };


            lector.onerror =
                function () {

                    reject(
                        new Error(
                            "No se pudo leer la imagen."
                        )
                    );

                };


            lector.readAsDataURL(
                archivo
            );

        }
    );

}


/* =====================================================
   PREPARAR FOTOS
===================================================== */

async function prepararFotos() {

    const archivoFrontal =
        $("cedulaFrontal")?.files?.[0] ||
        null;


    const archivoTrasera =
        $("cedulaTrasera")?.files?.[0] ||
        null;


    const archivoCliente =
        $("fotoCliente")?.files?.[0] ||
        null;


    return {

        cedulaFrontal:
            await comprimirImagen(
                archivoFrontal
            ),

        cedulaTrasera:
            await comprimirImagen(
                archivoTrasera
            ),

        fotoCliente:
            await comprimirImagen(
                archivoCliente
            )

    };

}

async function guardarRegistro() {

    const credito =
        window.creditoEnRegistro;


    if (!credito) {

        alert(
            "No se encontró la información del crédito."
        );

        return;

    }


    /* =========================
       DATOS DEL CLIENTE
    ========================= */

    const cliente = {

        nombre:
            $("nombreCompleto")?.value.trim() || "",

        tipoDocumento:
            $("tipoDocumento")?.value || "",

        documento:
            $("documento")?.value.trim() || "",

        fechaNacimiento:
            $("fechaNacimiento")?.value || "",

        telefono:
            $("telefono")?.value.trim() || "",

        telefonoAlternativo:
            $("telefonoAlternativo")?.value.trim() || "",

        correo:
            $("correo")?.value.trim() || "",

        direccion:
            $("direccion")?.value.trim() || "",

        ciudad:
            $("ciudad")?.value.trim() || "",

        barrio:
            $("barrio")?.value.trim() || ""

    };


    /* =========================
       DATOS DEL DISPOSITIVO
    ========================= */

    const dispositivo = {

        marca:
            $("marca")?.value.trim() || "",

        modelo:
            $("modelo")?.value.trim() || "",

        color:
            $("color")?.value.trim() || "",

        capacidad:
            $("capacidad")?.value.trim() || "",

        imei:
            $("imei")?.value.trim() || "",

        imei2:
            $("imei2")?.value.trim() || "",

        serial:
            $("serial")?.value.trim() || ""

    };


    /* =========================
       VALIDACIONES
    ========================= */

    if (!cliente.nombre) {

        alert(
            "Ingresa el nombre completo del cliente."
        );

        return;

    }


    if (!cliente.tipoDocumento) {

        alert(
            "Selecciona el tipo de documento."
        );

        return;

    }


    if (!cliente.documento) {

        alert(
            "Ingresa el número de documento."
        );

        return;

    }


    if (!cliente.telefono) {

        alert(
            "Ingresa el teléfono del cliente."
        );

        return;

    }


    if (!dispositivo.imei) {

        alert(
            "Ingresa el IMEI del dispositivo."
        );

        return;

    }


    /* =========================
    PREPARAR FOTOS
 ========================= */

    const fotos =
        await prepararFotos();


    /* =========================
       REGISTRO COMPLETO
    ========================= */

    const registroCompleto = {

        cliente: cliente,

        dispositivo: dispositivo,

        credito: credito,

        fotos: fotos,

        fechaRegistro:
            new Date().toISOString()

    };


    /* =========================
       DESACTIVAR BOTÓN
    ========================= */

    if (guardarBtn) {

        guardarBtn.disabled = true;

        guardarBtn.textContent =
            "Guardando información...";

    }


    try {

        /*
           Enviar información
           a Google Apps Script
        */

        const respuesta =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            registroCompleto
                        )
                }
            );


        const resultado =
            await respuesta.json();


        /*
           Error enviado
           por Apps Script
        */

        if (!resultado.success) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo guardar el crédito."
            );

        }


        /* =========================
           GUARDAR RESPALDO LOCAL
        ========================= */

        localStorage.setItem(
            "ultimoRegistro",
            JSON.stringify({
                ...registroCompleto,
                resultado:
                    resultado.resultado
            })
        );


        /* =========================
           MOSTRAR ÉXITO
        ========================= */

        alert(
            "✅ Crédito registrado correctamente.\n\n" +

            "Cliente: " +
            resultado.resultado.idCliente +

            "\nCrédito: " +
            resultado.resultado.idCredito +

            "\nCuotas generadas: " +
            resultado.resultado.cuotasGeneradas
        );


        /*
           Limpiar crédito pendiente
        */

        localStorage.removeItem(
            "creditoEnRegistro"
        );


        /*
           Volver al simulador
        */

        window.location.href =
            "./index.html";


    } catch (error) {

        console.error(
            "Error guardando registro:",
            error
        );


        alert(
            "❌ No se pudo guardar la información.\n\n" +
            error.message
        );


        /*
           Restaurar botón
        */

        if (guardarBtn) {

            guardarBtn.disabled = false;

            guardarBtn.textContent =
                "Guardar crédito";

        }

    }

}
