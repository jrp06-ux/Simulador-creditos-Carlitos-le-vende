/* =====================================================
   REFERENCIAS
===================================================== */

const $ = (id) => document.getElementById(id);

const calcularBtn = $("calcularBtn");
const whatsappBtn = $("whatsappBtn");

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
        Number.isFinite(Number(valor)) ? Number(valor) : 0
    );
}


function formatearFecha(fecha) {
    return formatoFecha.format(fecha);
}


/* =====================================================
   INICIO
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


    /*
       Guardado automático
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
       Tipo de cuota inicial
    */

    tipoInicialInput?.addEventListener(
        "change",
        () => {

            actualizarTipoInicial();

            guardarDatos();

        }
    );


    /*
       Actualizar cuota inicial automática
    */

    precioInput?.addEventListener(
        "input",
        actualizarInicialAutomatica
    );


    /*
       Protección
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
   PROTECCIÓN
===================================================== */

function actualizarProteccion() {

    const container =
        $("proteccionPrecioContainer");

    if (!container || !proteccionInput) {
        return;
    }


    /*
       El precio de protección solamente
       se muestra cuando está activa.
    */

    if (proteccionInput.value === "si") {

        container.style.display = "";

    } else {

        container.style.display = "none";

    }

}


/* =====================================================
   CUOTA INICIAL
===================================================== */

function actualizarTipoInicial() {

    if (!tipoInicialInput) {
        return;
    }


    const tipo =
        tipoInicialInput.value;


    /*
       TERCERA PARTE
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
       PESOS
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
   CUOTA INICIAL AUTOMÁTICA
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


    if (!Number.isFinite(precio) || precio <= 0) {

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

    const numeroCuotas =
        Number(cuotasInput.value);


    /* =================================================
       PROTECCIÓN
    ================================================= */

    const proteccionActiva =
        proteccionInput.value === "si";


    const valorProteccionMensual =
        Number(valorProteccionInput.value);


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (
        !Number.isFinite(precio) ||
        precio <= 0
    ) {

        alert(
            "Ingresa un precio válido."
        );

        return;

    }


    if (
        !Number.isFinite(interesMensual) ||
        interesMensual < 0
    ) {

        alert(
            "Ingresa un interés válido."
        );

        return;

    }


    if (
        !Number.isInteger(numeroCuotas) ||
        numeroCuotas <= 0
    ) {

        alert(
            "Selecciona un número válido de cuotas."
        );

        return;

    }


    if (
        proteccionActiva &&
        (
            !Number.isFinite(valorProteccionMensual) ||
            valorProteccionMensual < 0
        )
    ) {

        alert(
            "Ingresa un valor mensual válido para la protección."
        );

        return;

    }


    /* =================================================
       CALCULAR CUOTA INICIAL
    ================================================= */

    let inicial;


    /*
       PESOS / TERCERA PARTE
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
            !Number.isFinite(valorInicial) ||
            valorInicial <= 0 ||
            valorInicial >= 100
        ) {

            alert(
                "Ingresa un porcentaje entre 0 y 100."
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


    /* =================================================
       VALIDAR CUOTA INICIAL
    ================================================= */

    if (
        !Number.isFinite(inicial) ||
        inicial <= 0
    ) {

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
       
       Si el interés mensual es 3%:

       tasa quincenal =
       (1 + 0.03)^(1/2) - 1

       Esto produce aproximadamente 1.49%.
    ================================================= */

    const tasaMensual =
        interesMensual / 100;


    const tasaQuincenal =
        Math.pow(
            1 + tasaMensual,
            1 / 2
        ) - 1;


    /* =================================================
       CUOTA FINANCIERA QUINCENAL
    ================================================= */

    let cuotaFinanciera;


    if (tasaQuincenal === 0) {

        cuotaFinanciera =
            montoFinanciado /
            numeroCuotas;

    } else {

        cuotaFinanciera =
            montoFinanciado *
            (
                tasaQuincenal *
                Math.pow(
                    1 + tasaQuincenal,
                    numeroCuotas
                )
            )
            /
            (
                Math.pow(
                    1 + tasaQuincenal,
                    numeroCuotas
                ) - 1
            );

    }


    cuotaFinanciera =
        Math.round(cuotaFinanciera);


    /* =================================================
       TOTAL FINANCIERO
    ================================================= */

    const totalFinanciero =
        cuotaFinanciera *
        numeroCuotas;


    /*
       Total de intereses
    */

    const totalIntereses =
        totalFinanciero -
        montoFinanciado;


    /* =================================================
       PROTECCIÓN
    ================================================= */

    /*
       Cada 2 cuotas = 30 días.

       Ejemplo con 6 cuotas:

       2 → 1 mes
       4 → 2 meses
       6 → 3 meses
    */

    const mesesProteccion =
        proteccionActiva
            ? Math.floor(numeroCuotas / 2)
            : 0;


    const totalProteccion =
        proteccionActiva
            ? valorProteccionMensual *
              mesesProteccion
            : 0;


    /* =================================================
       TOTAL A PAGAR
    ================================================= */

    const totalPagar =
        totalFinanciero +
        totalProteccion;


    /* =================================================
       PORCENTAJE INICIAL
    ================================================= */

    const porcentajeInicial =
        (inicial / precio) * 100;


    /* =================================================
       OBJETO DEL CRÉDITO
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

        interes: interesMensual,

        tasaMensual,

        tasaQuincenal,

        cuotas: numeroCuotas,

        cuota: cuotaFinanciera,

        totalFinanciero,

        totalIntereses,

        proteccionActiva,

        proteccionMensual:
            proteccionActiva
                ? valorProteccionMensual
                : 0,

        mesesProteccion,

        totalProteccion,

        totalPagar

    };


    /* =================================================
       MOSTRAR
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


    $("resTotal").textContent =
        moneda(credito.totalPagar);


    $("resCuota").textContent =
        moneda(credito.cuota);


    $("resNumeroCuotas").textContent =
        `${credito.cuotas} cuotas quincenales`;

}


/* =====================================================
   TABLA DE PAGOS
===================================================== */

function generarTabla(credito) {

    const tabla =
        $("tablaCuotas");


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    const fragment =
        document.createDocumentFragment();


    const fechaInicio =
        new Date();


    /*
       Evita problemas si la hora actual
       provoca cambios inesperados de fecha.
    */

    fechaInicio.setHours(
        12,
        0,
        0,
        0
    );


    for (
        let numero = 1;
        numero <= credito.cuotas;
        numero++
    ) {

        /* =============================================
           FECHA

           Cada cuota está separada exactamente
           por 15 días.
        ============================================= */

        const fecha =
            new Date(fechaInicio);


        fecha.setDate(
            fecha.getDate() +
            (numero * 15)
        );


        /* =============================================
           PROTECCIÓN

           Se cobra cada 30 días:

           cuota 2
           cuota 4
           cuota 6
           etc.
        ============================================= */

        const cobraProteccion =
            credito.proteccionActiva &&
            numero % 2 === 0;


        const proteccion =
            cobraProteccion
                ? credito.proteccionMensual
                : 0;


        /* =============================================
           VALOR TOTAL DE LA CUOTA
        ============================================= */

        const valorCuota =
            credito.cuota +
            proteccion;


        /* =============================================
           FILA
        ============================================= */

        const fila =
            document.createElement("tr");


        fila.innerHTML = `
            <td>${numero}</td>

            <td>
                ${formatearFecha(fecha)}
            </td>

            <td>
                ${moneda(valorCuota)}

                ${
                    cobraProteccion
                        ? `
                            <small>
                                Protección: ${moneda(proteccion)}
                            </small>
                          `
                        : ""
                }
            </td>
        `;


        fragment.appendChild(
            fila
        );

    }


    tabla.appendChild(
        fragment
    );

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
       Número colombiano
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

    let mensaje =
`Hola ${credito.cliente || "👋"}.

Te compartimos la simulación de financiación de tu equipo:

📱 Equipo: ${credito.equipo || "No especificado"}

💰 Precio del equipo: ${moneda(credito.precio)}

💵 Cuota inicial: ${moneda(credito.inicial)}

📊 Monto financiado: ${moneda(credito.montoFinanciado)}

📈 Interés mensual: ${credito.interes}%

📆 Plazo: ${credito.cuotas} cuotas cada 15 días

💳 Valor de la cuota financiera: ${moneda(credito.cuota)}

💰 Total de intereses: ${moneda(credito.totalIntereses)}`;


    /* =================================================
       PROTECCIÓN
    ================================================= */

    if (credito.proteccionActiva) {

        mensaje +=
`

🛡️ Protección CARLITOS LE VENDE: Sí

💵 Valor mensual de protección: ${moneda(credito.proteccionMensual)}

📆 Cobro de protección: cada 30 días

📅 Meses de protección: ${credito.mesesProteccion}

🛡️ Total de protección: ${moneda(credito.totalProteccion)}`;

    } else {

        mensaje +=
`

🛡️ Protección CARLITOS LE VENDE: No agregada`;

    }


    /* =================================================
       TOTAL
    ================================================= */

    mensaje +=
`

💵 Total a pagar: ${moneda(credito.totalPagar)}

Las cuotas se generan cada 15 días.
Cuando se contrata la Protección CARLITOS LE VENDE,
su valor se cobra mensualmente cada 30 días y se
incluye en las cuotas correspondientes.

Esta información corresponde a una simulación
de financiación de CARLITOS LE VENDE.`;


    /* =================================================
       WHATSAPP
    ================================================= */

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

    if (
        !clienteInput ||
        !telefonoInput ||
        !equipoInput
    ) {
        return;
    }


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


    if (!guardado) {
        return;
    }


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
            "20000";


    } catch (error) {

        console.error(
            "Error al cargar datos:",
            error
        );

    }

}


/* =====================================================
   NUEVA SIMULACIÓN
===================================================== */

function nuevaSimulacion() {

    const confirmar =
        confirm(
            "¿Quieres borrar los datos de la simulación actual?"
        );


    if (!confirmar) {
        return;
    }


    /* =================================================
       BORRAR STORAGE
    ================================================= */

    localStorage.removeItem(
        STORAGE_KEY
    );


    /* =================================================
       LIMPIAR INPUTS
    ================================================= */

    document
        .querySelectorAll("input")
        .forEach(input => {

            input.value = "";

        });


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
        "20000";


    /* =================================================
       LIMPIAR RESULTADOS
    ================================================= */

    const resultados = {

        resPrecio: "$0",

        resInicial: "$0",

        resFinanciado: "$0",

        resIntereses: "$0",

        resTotal: "$0",

        resCuota: "$0",

        resNumeroCuotas: "0 cuotas"

    };


    Object.entries(resultados)
        .forEach(([id, valor]) => {

            const elemento =
                $(id);

            if (elemento) {

                elemento.textContent =
                    valor;

            }

        });


    /* =================================================
       LIMPIAR TABLA
    ================================================= */

    if ($("tablaCuotas")) {

        $("tablaCuotas").innerHTML =
            "";

    }


    /* =================================================
       ELIMINAR CRÉDITO ACTUAL
    ================================================= */

    window.creditoActual =
        null;


    /* =================================================
       ACTUALIZAR INTERFAZ
    ================================================= */

    actualizarTipoInicial();

    actualizarProteccion();

}
