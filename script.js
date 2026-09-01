/* =====================================================
   REFERENCIAS
===================================================== */

const $ = (id) => document.getElementById(id);

const calcularBtn = $("calcularBtn");
const whatsappBtn = $("whatsappBtn");
const cerrarCreditoBtn = $("cerrarCreditoBtn");

const clienteInput = $("cliente");
const telefonoInput = $("telefono");
const equipoInput = $("equipo");
const precioInput = $("precio");
const tipoInicialInput = $("tipoInicial");
const inicialInput = $("inicial");
const interesInput = $("interes");
const cuotasInput = $("cuotas");

const proteccionInput = $("proteccion");
const valorProteccionInput = $("valorProteccion");

const simboloInicial = $("simboloInicial");
const ayudaInicial = $("ayudaInicial");

const STORAGE_KEY = "simuladorCredito";

const GASTOS_PLATAFORMA = 150000;


/* =====================================================
   FORMATEADORES
===================================================== */

const formatoMoneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});


function moneda(valor) {

    return formatoMoneda.format(
        Math.round(Number(valor) || 0)
    );

}


function formatearFecha(fecha) {

    return formatoFecha.format(fecha);

}


/* =====================================================
   INICIAR APLICACIÓN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    actualizarTipoInicial();

    actualizarProteccion();

    activarEventos();

});


/* =====================================================
   EVENTOS
===================================================== */

function activarEventos() {

    calcularBtn?.addEventListener(
        "click",
        calcularCredito
    );


    whatsappBtn?.addEventListener(
        "click",
        enviarWhatsApp
    );


    cerrarCreditoBtn?.addEventListener(
        "click",
        cerrarCredito
    );

    /*
       GUARDADO AUTOMÁTICO
    */

    document
        .querySelectorAll("input, select")
        .forEach(campo => {

            campo.addEventListener(
                "input",
                guardarDatos
            );

            campo.addEventListener(
                "change",
                guardarDatos
            );

        });


    /*
       CAMBIAR TIPO DE INICIAL
    */

    tipoInicialInput?.addEventListener(
        "change",
        () => {

            actualizarTipoInicial();

            guardarDatos();

        }
    );


    /*
       ACTUALIZAR 1/3 AUTOMÁTICAMENTE
    */

    precioInput?.addEventListener(
        "input",
        () => {

            actualizarInicialAutomatica();

            actualizarProteccion();

        }
    );


    /*
       ACTIVAR / DESACTIVAR PROTECCIÓN
    */

    proteccionInput?.addEventListener(
        "change",
        () => {

            actualizarProteccion();

            guardarDatos();

        }
    );

}


/* =====================================================
   PROTECCIÓN CARLITOS LE VENDE
===================================================== */

function calcularValorProteccion(precio) {

    /*
       Hasta $1.000.000
    */

    if (precio <= 1000000) {

        return 8000;

    }


    /*
       Más de $1.000.000 hasta $2.000.000
    */

    if (precio <= 2000000) {

        return 12000;

    }


    /*
       Más de $2.000.000 hasta $3.000.000
    */

    if (precio <= 3000000) {

        return 14500;

    }


    /*
       Más de $3.000.000 hasta $4.000.000
    */

    if (precio <= 4000000) {

        return 16500;

    }


    /*
       Más de $4.000.000
    */

    return 18000;

}


function actualizarProteccion() {

    const container =
        $("proteccionPrecioContainer");


    if (
        !proteccionInput ||
        !container ||
        !valorProteccionInput
    ) {

        return;

    }


    /*
       SI NO HAY PROTECCIÓN
    */

    if (proteccionInput.value !== "si") {

        container.style.display = "none";

        return;

    }


    /*
       MOSTRAR PROTECCIÓN
    */

    container.style.display = "";


    const precio =
        Number(precioInput.value);


    /*
       SI HAY PRECIO VÁLIDO,
       CALCULAR AUTOMÁTICAMENTE
    */

    if (precio > 0) {

        const valor =
            calcularValorProteccion(precio);


        valorProteccionInput.value =
            valor;

    }


    /*
       NO PERMITIR MODIFICAR
       MANUALMENTE EL VALOR
    */

    valorProteccionInput.readOnly = true;

}


/* =====================================================
   CUOTA INICIAL
===================================================== */

function actualizarTipoInicial() {

    if (!tipoInicialInput) return;


    const tipo =
        tipoInicialInput.value;


    /*
       RECOMENDADA 1/3
    */

    if (tipo === "terceraParte") {

        inicialInput.disabled = false;


        if (simboloInicial) {

            simboloInicial.textContent = "$";

        }


        if (ayudaInicial) {

            ayudaInicial.textContent =
                "Se recomienda una cuota inicial equivalente a la tercera parte del valor del equipo. Puedes modificarla.";

        }


        inicialInput.placeholder =
            "Valor recomendado automáticamente";


        actualizarInicialAutomatica();

        return;

    }


    /*
       VALOR EN PESOS
    */

    if (tipo === "pesos") {

        inicialInput.disabled = false;


        if (simboloInicial) {

            simboloInicial.textContent = "$";

        }


        if (ayudaInicial) {

            ayudaInicial.textContent =
                "Ingresa el valor que el cliente dará como cuota inicial.";

        }


        inicialInput.placeholder =
            "Ej. 500000";

        return;

    }


    /*
       PORCENTAJE
    */

    if (tipo === "porcentaje") {

        inicialInput.disabled = false;


        if (simboloInicial) {

            simboloInicial.textContent = "%";

        }


        if (ayudaInicial) {

            ayudaInicial.textContent =
                "Ingresa el porcentaje que el cliente dará como cuota inicial.";

        }


        inicialInput.placeholder =
            "Ej. 30";

    }

}


/* =====================================================
   CALCULAR 1/3 AUTOMÁTICAMENTE
===================================================== */

function actualizarInicialAutomatica() {

    if (
        !tipoInicialInput ||
        tipoInicialInput.value !== "terceraParte"
    ) {

        return;

    }


    const precio =
        Number(precioInput.value);


    if (!precio || precio <= 0) {

        inicialInput.value = "";

        return;

    }


    inicialInput.value =
        Math.round(precio / 3);

}


/* =====================================================
   CALCULAR CRÉDITO
===================================================== */

function calcularCredito() {

    /* =================================================
       DATOS
    ================================================= */

    const cliente =
        clienteInput.value.trim();

    const telefono =
        telefonoInput.value.trim();

    const equipo =
        equipoInput.value.trim();

    const precio =
        Number(precioInput.value);

    const tipoInicial =
        tipoInicialInput.value;

    const valorInicial =
        Number(inicialInput.value);

    const interesMensual =
        Number(interesInput.value);

    const cuotas =
        Number(cuotasInput.value);


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (!precio || precio <= 0) {

        alert("Ingresa un precio válido.");

        return;

    }


    if (
        isNaN(interesMensual) ||
        interesMensual < 0
    ) {

        alert("Ingresa un interés válido.");

        return;

    }


    if (!cuotas || cuotas <= 0) {

        alert(
            "Selecciona un número válido de cuotas."
        );

        return;

    }


    /* =================================================
       CUOTA INICIAL
    ================================================= */

    let inicial;


    /*
       TERCERA PARTE O PESOS
    */

    if (
        tipoInicial === "terceraParte" ||
        tipoInicial === "pesos"
    ) {

        inicial =
            valorInicial;

    }


    /*
       PORCENTAJE
    */

    else if (
        tipoInicial === "porcentaje"
    ) {

        if (
            !valorInicial ||
            valorInicial <= 0 ||
            valorInicial >= 100
        ) {

            alert(
                "Ingresa un porcentaje válido entre 1 y 99."
            );

            return;

        }


        inicial =
            precio *
            (valorInicial / 100);

    }


    else {

        alert(
            "Selecciona un tipo de cuota inicial válido."
        );

        return;

    }


    inicial =
        Math.round(inicial);


    /*
       VALIDAR INICIAL
    */

    if (!inicial || inicial <= 0) {

        alert(
            "Ingresa una cuota inicial válida."
        );

        return;

    }


    if (inicial >= precio) {

        alert(
            "La cuota inicial debe ser menor que el precio del equipo."
        );

        return;

    }


    /* =================================================
       MONTO FINANCIADO
    ================================================= */

    const montoFinanciado =
        precio - inicial;


    /* =================================================
       INTERÉS MENSUAL → QUINCENAL

       Conversión efectiva:

       (1 + tasa mensual)^(1/2) - 1
    ================================================= */

    const tasaMensual =
        interesMensual / 100;


    const tasaQuincenal =
        Math.pow(
            1 + tasaMensual,
            1 / 2
        ) - 1;


    /* =================================================
       CUOTA FINANCIERA

       Incluye capital + intereses.
    ================================================= */

    let cuotaFinanciera;


    if (tasaQuincenal === 0) {

        cuotaFinanciera =
            montoFinanciado / cuotas;

    } else {

        cuotaFinanciera =
            montoFinanciado *
            (
                tasaQuincenal *
                Math.pow(
                    1 + tasaQuincenal,
                    cuotas
                )
            )
            /
            (
                Math.pow(
                    1 + tasaQuincenal,
                    cuotas
                ) - 1
            );

    }


    cuotaFinanciera =
        Math.round(cuotaFinanciera);


    /* =================================================
       TOTAL FINANCIERO
    ================================================= */

    const totalFinanciero =
        cuotaFinanciera * cuotas;


    const totalIntereses =
        totalFinanciero -
        montoFinanciado;


    /* =================================================
       PROTECCIÓN
    ================================================= */

    const proteccionActiva =
        proteccionInput.value === "si";


    let proteccionPorCuota = 0;


    if (proteccionActiva) {

        proteccionPorCuota =
            calcularValorProteccion(precio);

    }


    const totalProteccion =
        proteccionPorCuota * cuotas;


    /* =================================================
       GASTOS Y MANTENIMIENTO DE PLATAFORMA

       $150.000 DISTRIBUIDOS ENTRE TODAS LAS CUOTAS
    ================================================= */

    const gastosPlataforma =
        GASTOS_PLATAFORMA;


    const plataformaPorCuota =
        gastosPlataforma / cuotas;


    /* =================================================
       CUOTA FINAL

       CUOTA FINANCIERA
       + PROTECCIÓN
       + PLATAFORMA
    ================================================= */

    const cuotaFinalExacta =
        cuotaFinanciera +
        proteccionPorCuota +
        plataformaPorCuota;


    /* =================================================
       TOTAL A PAGAR

       Crédito + intereses
       + protección
       + plataforma
    ================================================= */

    const totalPagar =
        totalFinanciero +
        totalProteccion +
        gastosPlataforma;


    /* =================================================
       PORCENTAJE INICIAL
    ================================================= */

    const porcentajeInicial =
        (inicial / precio) * 100;


    /* =================================================
       GUARDAR CRÉDITO
    ================================================= */

    window.creditoActual = {

        cliente,
        telefono,
        equipo,

        precio,

        tipoInicial,

        inicial,

        porcentajeInicial,

        montoFinanciado,

        interesMensual,

        tasaQuincenal,

        cuotas,

        cuotaFinanciera,

        totalFinanciero,

        totalIntereses,

        proteccionActiva,

        proteccionPorCuota,

        totalProteccion,

        gastosPlataforma,

        plataformaPorCuota,

        cuotaFinalExacta,

        totalPagar

    };


    /* =================================================
       MOSTRAR RESULTADOS
    ================================================= */

    mostrarResultados(
        window.creditoActual
    );


    generarTabla(
        window.creditoActual
    );


    guardarDatos();

}


/* =====================================================
   MOSTRAR RESULTADOS
===================================================== */

function mostrarResultados(credito) {

    $("resPrecio").textContent =
        moneda(credito.precio);


    $("resInicial").textContent =
        moneda(credito.inicial);


    $("resFinanciado").textContent =
        moneda(credito.montoFinanciado);


    $("resIntereses").textContent =
        moneda(credito.totalIntereses);


    /*
       El total incluye:
       crédito + intereses + protección + plataforma
    */

    $("resTotal").textContent =
        moneda(credito.totalPagar);


    /*
       Mostramos la cuota final aproximada.

       En la tabla se ajustan los redondeos
       para que el total sea exacto.
    */

    $("resCuota").textContent =
        moneda(credito.cuotaFinalExacta);


    $("resNumeroCuotas").textContent =
        `${credito.cuotas} cuotas cada 15 días`;

}


/* =====================================================
   GENERAR TABLA DE PAGOS
===================================================== */

function generarTabla(credito) {

    const tabla =
        $("tablaCuotas");


    tabla.innerHTML = "";


    const fragment =
        document.createDocumentFragment();


    /*
       FECHA DE INICIO
    */

    const fechaInicio =
        new Date();


    fechaInicio.setHours(
        12,
        0,
        0,
        0
    );


    /*
       Para distribuir exactamente
       los $150.000 incluso cuando
       la división da decimales.
    */

    const plataformaBase =
        Math.floor(
            credito.gastosPlataforma /
            credito.cuotas
        );


    const plataformaRestante =
        credito.gastosPlataforma -
        (
            plataformaBase *
            credito.cuotas
        );


    /*
       El restante se distribuye
       $1 por cuota al principio.

       Así la suma siempre da
       exactamente $150.000.
    */


    for (
        let i = 1;
        i <= credito.cuotas;
        i++
    ) {

        /* =============================================
           FECHA

           15 / 30 / 45 / 60 días
        ============================================= */

        const fecha =
            new Date(fechaInicio);


        fecha.setDate(
            fecha.getDate() +
            (i * 15)
        );


        /* =============================================
           PLATAFORMA

           Distribución exacta
        ============================================= */

        const plataformaCuota =
            plataformaBase +
            (
                i <= plataformaRestante
                    ? 1
                    : 0
            );


        /* =============================================
           PROTECCIÓN
        ============================================= */

        const proteccion =
            credito.proteccionActiva
                ? credito.proteccionPorCuota
                : 0;


        /* =============================================
           VALOR FINAL
        ============================================= */

        const valorCuota =
            credito.cuotaFinanciera +
            proteccion +
            plataformaCuota;


        /* =============================================
           FILA
        ============================================= */

        const fila =
            document.createElement("tr");


        fila.innerHTML = `
            <td>${i}</td>

            <td>
                ${formatearFecha(fecha)}
                <br>
                <small>Día ${i * 15}</small>
            </td>

            <td>
                <strong>
                    ${moneda(valorCuota)}
                </strong>

                <br>

                <small>
                    Crédito: ${moneda(credito.cuotaFinanciera)}
                </small>

                ${credito.proteccionActiva
                ? `
                            <br>
                            <small>
                                🛡️ Protección: ${moneda(proteccion)}
                            </small>
                        `
                : ""
            }

                <br>

                <small>
                    💻 Plataforma: ${moneda(plataformaCuota)}
                </small>
            </td>
        `;


        fragment.appendChild(fila);

    }


    tabla.appendChild(fragment);

}


/* =====================================================
   WHATSAPP
===================================================== */

function enviarWhatsApp() {

    const credito =
        window.creditoActual;


    if (!credito) {

        alert(
            "Primero debes calcular la financiación."
        );

        return;

    }


    let telefono =
        credito.telefono.replace(
            /\D/g,
            ""
        );


    /*
       NÚMERO COLOMBIANO
    */

    if (
        telefono.startsWith("3") &&
        telefono.length === 10
    ) {

        telefono =
            "57" + telefono;

    }


    if (telefono.length < 10) {

        alert(
            "Verifica el número de WhatsApp."
        );

        return;

    }


    /* =================================================
       MENSAJE
    ================================================= */

    let mensaje = `Hola ${credito.cliente || "👋"}.

Te compartimos la simulación de financiación de tu equipo:

📱 Equipo: ${credito.equipo || "No especificado"}

💰 Precio del equipo: ${moneda(credito.precio)}

💵 Cuota inicial: ${moneda(credito.inicial)}

📊 Monto financiado: ${moneda(credito.montoFinanciado)}

📈 Interés mensual: ${credito.interesMensual}%

📆 Plazo: ${credito.cuotas} cuotas cada 15 días

💳 Cuota financiera:
${moneda(credito.cuotaFinanciera)}

💰 Total de intereses:
${moneda(credito.totalIntereses)}`;


    /* =================================================
       PROTECCIÓN
    ================================================= */

    if (credito.proteccionActiva) {

        mensaje += `

🛡️ PROTECCIÓN CARLITOS LE VENDE

Valor por cuota:
${moneda(credito.proteccionPorCuota)}

Total protección:
${moneda(credito.totalProteccion)}`;

    } else {

        mensaje += `

🛡️ Protección CARLITOS LE VENDE:
No agregada`;

    }


    /* =================================================
       PLATAFORMA
    ================================================= */

    mensaje += `

💻 GASTOS Y MANTENIMIENTO DE PLATAFORMA

Valor total:
${moneda(credito.gastosPlataforma)}

Este valor se distribuye entre las ${credito.cuotas} cuotas.`;


    /* =================================================
       CUOTA FINAL
    ================================================= */

    mensaje += `

💳 Valor aproximado de cada cuota:
${moneda(credito.cuotaFinalExacta)}

💰 TOTAL A PAGAR:
${moneda(credito.totalPagar)}

📆 Las cuotas se pagan cada 15 días.

El valor de cada cuota incluye el crédito financiado, los intereses, la Protección CARLITOS LE VENDE cuando está incluida y la parte correspondiente de gastos y mantenimiento de plataforma.

Esta información corresponde a una simulación de financiación de CARLITOS LE VENDE.`;


    const url =
        `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   LOCALSTORAGE
===================================================== */

function guardarDatos() {

    const datos = {

        cliente:
            clienteInput.value,

        telefono:
            telefonoInput.value,

        equipo:
            equipoInput.value,

        precio:
            precioInput.value,

        tipoInicial:
            tipoInicialInput.value,

        inicial:
            inicialInput.value,

        interes:
            interesInput.value,

        cuotas:
            cuotasInput.value,

        proteccion:
            proteccionInput.value,

        valorProteccion:
            valorProteccionInput.value

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(datos)
    );

}


/* =====================================================
   CARGAR DATOS
===================================================== */

function cargarDatos() {

    const guardado =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!guardado) return;


    try {

        const datos =
            JSON.parse(guardado);


        clienteInput.value =
            datos.cliente || "";


        telefonoInput.value =
            datos.telefono || "";


        equipoInput.value =
            datos.equipo || "";


        precioInput.value =
            datos.precio || "";


        tipoInicialInput.value =
            datos.tipoInicial ||
            "terceraParte";


        inicialInput.value =
            datos.inicial || "";


        interesInput.value =
            datos.interes || "";


        cuotasInput.value =
            datos.cuotas || "6";


        proteccionInput.value =
            datos.proteccion ||
            "no";


        valorProteccionInput.value =
            datos.valorProteccion ||
            "";


    } catch (error) {

        console.error(
            "Error al cargar datos:",
            error
        );

    }

}

/* =====================================================
   CERRAR CRÉDITO
===================================================== */

function cerrarCredito() {

    const credito = window.creditoActual;


    /*
       Verificar que exista una simulación
    */

    if (!credito) {

        alert(
            "Primero debes calcular la financiación antes de cerrar el crédito."
        );

        return;

    }


    /*
       Confirmar acción
    */

    const confirmar = confirm(
        `¿Deseas continuar con el registro del crédito de ${credito.cliente || "este cliente"
        }?`
    );


    if (!confirmar) return;


    /*
       Guardar información completa del crédito
       para utilizarla en registro.html
    */

    localStorage.setItem(
        "creditoEnRegistro",
        JSON.stringify(credito)
    );


    /*
       Ir a la página de registro
    */

    window.location.href =
        "registro.html";

}

/* =====================================================
   NUEVA SIMULACIÓN
===================================================== */

function nuevaSimulacion() {

    const confirmar =
        confirm(
            "¿Quieres borrar los datos de la simulación actual?"
        );


    if (!confirmar) return;


    /* =================================================
       BORRAR LOCALSTORAGE
    ================================================= */

    localStorage.removeItem(
        STORAGE_KEY
    );


    /* =================================================
       LIMPIAR INPUTS
    ================================================= */

    clienteInput.value = "";

    telefonoInput.value = "";

    equipoInput.value = "";

    precioInput.value = "";

    inicialInput.value = "";

    interesInput.value = "";


    /* =================================================
       VALORES POR DEFECTO
    ================================================= */

    tipoInicialInput.value =
        "terceraParte";


    cuotasInput.value =
        "6";


    proteccionInput.value =
        "no";


    valorProteccionInput.value =
        "";


    /* =================================================
       LIMPIAR RESULTADOS
    ================================================= */

    $("resPrecio").textContent =
        "$0";

    $("resInicial").textContent =
        "$0";

    $("resFinanciado").textContent =
        "$0";

    $("resIntereses").textContent =
        "$0";

    $("resTotal").textContent =
        "$0";

    $("resCuota").textContent =
        "$0";

    $("resNumeroCuotas").textContent =
        "0 cuotas";


    /* =================================================
       LIMPIAR TABLA
    ================================================= */

    $("tablaCuotas").innerHTML =
        "";


    /* =================================================
       BORRAR CRÉDITO ACTUAL
    ================================================= */

    window.creditoActual =
        null;


    /* =================================================
       ACTUALIZAR INTERFAZ
    ================================================= */

    actualizarTipoInicial();

    actualizarProteccion();

}
