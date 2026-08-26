/* =====================================================
   REFERENCIAS A ELEMENTOS
===================================================== */

const calcularBtn = document.getElementById("calcularBtn");
const whatsappBtn = document.getElementById("whatsappBtn");


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    activarGuardadoAutomatico();

});


/* =====================================================
   BOTÓN CALCULAR
===================================================== */

calcularBtn.addEventListener("click", calcularCredito);


/* =====================================================
   CALCULAR CRÉDITO
===================================================== */

function calcularCredito() {

    const cliente =
        document.getElementById("cliente").value.trim();

    const telefono =
        document.getElementById("telefono").value.trim();

    const equipo =
        document.getElementById("equipo").value.trim();

    const precio =
        Number(document.getElementById("precio").value);

    const inicial =
        Number(document.getElementById("inicial").value);

    const interes =
        Number(document.getElementById("interes").value);

    const cuotas =
        Number(document.getElementById("cuotas").value);


    /* =================================================
       VALIDACIONES
    ================================================= */

    if (!precio || precio <= 0) {

        alert("Ingresa el precio del equipo.");

        return;
    }


    if (inicial < 0 || inicial >= precio) {

        alert(
            "La cuota inicial debe ser menor que el precio del equipo."
        );

        return;
    }


    if (interes < 0) {

        alert("El interés no puede ser negativo.");

        return;
    }


    if (!cuotas || cuotas <= 0) {

        alert("Selecciona un número de cuotas válido.");

        return;
    }


    /* =================================================
       CÁLCULO
    ================================================= */

    const montoFinanciado =
        precio - inicial;


    const tasa =
        interes / 100;


    let cuota;


    /*
        Interés 0%
    */

    if (tasa === 0) {

        cuota =
            montoFinanciado / cuotas;

    }


    /*
        Interés sobre saldo
    */

    else {

        cuota =
            montoFinanciado *
            (
                tasa *
                Math.pow(1 + tasa, cuotas)
            ) /
            (
                Math.pow(1 + tasa, cuotas) - 1
            );

    }


    const totalPagar =
        cuota * cuotas;


    const totalIntereses =
        totalPagar - montoFinanciado;


    /* =================================================
       MOSTRAR RESULTADOS
    ================================================= */

    document.getElementById("resPrecio").textContent =
        moneda(precio);


    document.getElementById("resInicial").textContent =
        moneda(inicial);


    document.getElementById("resFinanciado").textContent =
        moneda(montoFinanciado);


    document.getElementById("resIntereses").textContent =
        moneda(totalIntereses);


    document.getElementById("resTotal").textContent =
        moneda(totalPagar);


    document.getElementById("resCuota").textContent =
        moneda(cuota);


    document.getElementById("resNumeroCuotas").textContent =
        `${cuotas} cuotas`;


    /* =================================================
       GENERAR TABLA
    ================================================= */

    generarTabla(
        cuota,
        cuotas
    );


    /* =================================================
       GUARDAR CRÉDITO ACTUAL
    ================================================= */

    window.creditoActual = {

        cliente,
        telefono,
        equipo,
        precio,
        inicial,
        montoFinanciado,
        interes,
        cuotas,
        cuota,
        totalIntereses,
        totalPagar

    };


    /*
        Guardamos inmediatamente
        después de calcular.
    */

    guardarDatos();

}


/* =====================================================
   GENERAR TABLA DE CUOTAS
===================================================== */

function generarTabla(cuota, numeroCuotas) {

    const tabla =
        document.getElementById("tablaCuotas");


    tabla.innerHTML = "";


    const fechaActual =
        new Date();


    for (
        let i = 1;
        i <= numeroCuotas;
        i++
    ) {

        const fecha =
            new Date(fechaActual);


        fecha.setMonth(
            fecha.getMonth() + i
        );


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${i}
            </td>

            <td>
                ${formatearFecha(fecha)}
            </td>

            <td>
                ${moneda(cuota)}
            </td>

        `;


        tabla.appendChild(fila);

    }

}


/* =====================================================
   WHATSAPP
===================================================== */

whatsappBtn.addEventListener(
    "click",
    enviarWhatsApp
);


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
        credito.telefono.replace(/\D/g, "");


    /*
        Si el número comienza por 3,
        asumimos que es un celular colombiano.
    */

    if (telefono.startsWith("3")) {

        telefono =
            "57" + telefono;

    }


    if (telefono.length < 12) {

        alert(
            "Verifica el número de WhatsApp del cliente."
        );

        return;
    }


    const mensaje = `Hola ${credito.cliente || "👋"}.

Te compartimos la simulación de financiación de tu equipo:

📱 Equipo: ${credito.equipo || "No especificado"}

💰 Precio del equipo: ${moneda(credito.precio)}

💵 Cuota inicial: ${moneda(credito.inicial)}

📊 Monto financiado: ${moneda(credito.montoFinanciado)}

📈 Interés mensual: ${credito.interes}%

📆 Plazo: ${credito.cuotas} cuotas

💳 Valor de cada cuota: ${moneda(credito.cuota)}

💰 Total de intereses: ${moneda(credito.totalIntereses)}

💵 Total a pagar: ${moneda(credito.totalPagar)}

Esta información corresponde a una simulación de financiación de CARLITOS LE VENDE.`;


    const url =
        `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;


    window.open(
        url,
        "_blank"
    );

}


/* =====================================================
   GUARDADO AUTOMÁTICO
===================================================== */

function activarGuardadoAutomatico() {

    const campos =
        document.querySelectorAll(
            "input, select"
        );


    campos.forEach(campo => {

        /*
            Para campos de texto y números
        */

        campo.addEventListener(
            "input",
            guardarDatos
        );


        /*
            Para select
        */

        campo.addEventListener(
            "change",
            guardarDatos
        );

    });

}


/* =====================================================
   GUARDAR DATOS EN LOCALSTORAGE
===================================================== */

function guardarDatos() {

    const datos = {

        cliente:
            document.getElementById("cliente").value,

        telefono:
            document.getElementById("telefono").value,

        equipo:
            document.getElementById("equipo").value,

        precio:
            document.getElementById("precio").value,

        inicial:
            document.getElementById("inicial").value,

        interes:
            document.getElementById("interes").value,

        cuotas:
            document.getElementById("cuotas").value

    };


    localStorage.setItem(
        "simuladorCredito",
        JSON.stringify(datos)
    );

}


/* =====================================================
   CARGAR DATOS GUARDADOS
===================================================== */

function cargarDatos() {

    const datosGuardados =
        localStorage.getItem(
            "simuladorCredito"
        );


    /*
        Si no hay información guardada,
        no hacemos nada.
    */

    if (!datosGuardados) {

        return;

    }


    try {

        const datos =
            JSON.parse(datosGuardados);


        document.getElementById("cliente").value =
            datos.cliente || "";


        document.getElementById("telefono").value =
            datos.telefono || "";


        document.getElementById("equipo").value =
            datos.equipo || "";


        document.getElementById("precio").value =
            datos.precio || "";


        document.getElementById("inicial").value =
            datos.inicial || "";


        document.getElementById("interes").value =
            datos.interes || "";


        document.getElementById("cuotas").value =
            datos.cuotas || "6";


    }

    catch (error) {

        console.error(
            "No se pudieron cargar los datos guardados:",
            error
        );

    }

}


/* =====================================================
   LIMPIAR SIMULACIÓN
===================================================== */

function nuevaSimulacion() {

    const confirmar =
        confirm(
            "¿Quieres borrar los datos de la simulación actual?"
        );


    if (!confirmar) {

        return;

    }


    /*
        Borrar almacenamiento
    */

    localStorage.removeItem(
        "simuladorCredito"
    );


    /*
        Limpiar formulario
    */

    document
        .querySelectorAll("input")
        .forEach(input => {

            input.value = "";

        });


    /*
        Volver a 6 cuotas
    */

    document.getElementById("cuotas").value =
        "6";


    /*
        Limpiar resultados
    */

    document.getElementById("resPrecio").textContent =
        "$0";


    document.getElementById("resInicial").textContent =
        "$0";


    document.getElementById("resFinanciado").textContent =
        "$0";


    document.getElementById("resIntereses").textContent =
        "$0";


    document.getElementById("resTotal").textContent =
        "$0";


    document.getElementById("resCuota").textContent =
        "$0";


    document.getElementById("resNumeroCuotas").textContent =
        "0 cuotas";


    document.getElementById("tablaCuotas").innerHTML =
        "";


    /*
        Eliminar crédito actual
    */

    window.creditoActual =
        null;

}


/* =====================================================
   FORMATO MONEDA
===================================================== */

function moneda(valor) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }
    ).format(valor);

}


/* =====================================================
   FORMATO FECHA
===================================================== */

function formatearFecha(fecha) {

    return new Intl.DateTimeFormat(
        "es-CO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(fecha);

}