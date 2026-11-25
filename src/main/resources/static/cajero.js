"use strict";

/* =====================================================
   1. REFERENCIAS A LOS ELEMENTOS HTML
   ===================================================== */

const contenido = document.getElementById("contenido");
const tarjeta = document.getElementById("tarjeta");
const luzLector = document.getElementById("luzLector");
const ayudaTarjeta = document.getElementById("ayudaTarjeta");
const explicacion = document.getElementById("explicacion");

const cancelar = document.getElementById("cancelar");
const borrar = document.getElementById("borrar");
const aceptar = document.getElementById("aceptar");

const botonesNumericos = [
    ...document.querySelectorAll("[data-numero]")
];

const pasos = [
    ...document.querySelectorAll("#pasos li")
];

const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


/* =====================================================
   2. ESTADO DE LA SIMULACIÓN
   ===================================================== */

/*
   Estados posibles:

   bienvenida  → Esperando la tarjeta.
   insertando  → Animación de entrada.
   leyendo     → Simulación de lectura.
   pin         → Ingreso de cuatro dígitos.
   preparado   → Entrada completada, sin autenticar.
   devolviendo → Animación de devolución.
*/

let estado = "bienvenida";
let pin = "";
let temporizador;


/* =====================================================
   3. CONTROL DEL TIEMPO
   ===================================================== */

/*
   Solo mantenemos una transición pendiente.
   Al cancelar, podemos detenerla para evitar que aparezca
   otra pantalla después de devolver la tarjeta.
*/
function programar(accion, duracion) {
    clearTimeout(temporizador);

    const espera = movimientoReducido.matches
        ? 100
        : duracion;

    temporizador = setTimeout(accion, espera);
}


/* =====================================================
   4. CAMBIO DE PANTALLAS Y CONTROLES
   ===================================================== */

function mostrarEstado(nuevoEstado) {
    estado = nuevoEstado;

    const ingresandoPin = estado === "pin";

    // Los números solo funcionan durante el ingreso del PIN.
    botonesNumericos.forEach((boton) => {
        boton.disabled = !ingresandoPin;
    });

    borrar.disabled = !ingresandoPin;
    aceptar.disabled = !ingresandoPin;

    const permiteCancelar = [
        "insertando",
        "leyendo",
        "pin",
        "preparado"
    ].includes(estado);

    cancelar.disabled = !permiteCancelar;

    // La tarjeta solo se puede insertar desde la bienvenida.
    tarjeta.disabled = estado !== "bienvenida";

    const tarjetaDentro = ![
        "bienvenida",
        "devolviendo"
    ].includes(estado);

    tarjeta.classList.toggle("dentro", tarjetaDentro);

    const lectorActivo = [
        "insertando",
        "leyendo",
        "devolviendo"
    ].includes(estado);

    luzLector.classList.toggle("activa", lectorActivo);

    actualizarPasos();

    // Cada estado dibuja su propio contenido.
    switch (estado) {
        case "bienvenida":
            mostrarBienvenida();
            break;

        case "insertando":
        case "leyendo":
            mostrarLectura();
            break;

        case "pin":
            mostrarIngresoPin();
            break;

        case "preparado":
            mostrarEntradaCompletada();
            break;

        case "devolviendo":
            mostrarDevolucion();
            break;
    }
}

function actualizarPasos() {
    const indicePorEstado = {
        bienvenida: 0,
        insertando: 0,
        leyendo: 1,
        pin: 2,
        preparado: 3,
        devolviendo: 0
    };

    const indiceActual = indicePorEstado[estado];

    pasos.forEach((paso, indice) => {
        paso.classList.toggle(
            "actual",
            indice === indiceActual
        );
    });
}

function mostrarBienvenida() {
    contenido.innerHTML = `
        <span class="icono-pantalla" aria-hidden="true">
            ▤
        </span>

        <h2>
            Tu próxima operación<br>
            comienza aquí.
        </h2>

        <p>
            Inserta la tarjeta ficticia en el lector
            para comenzar.
        </p>
    `;

    explicacion.textContent =
        "Pulsa la tarjeta del lector. Puedes recorrer esta " +
        "simulación sin usar datos reales.";

    ayudaTarjeta.innerHTML = `
        Pulsa la tarjeta<br>
        para insertarla
    `;
}

function mostrarLectura() {
    const insertando = estado === "insertando";

    const titulo = insertando
        ? "Insertando tarjeta…"
        : "Leyendo tarjeta…";

    contenido.innerHTML = `
        <span class="spinner" aria-hidden="true"></span>

        <h2>${titulo}</h2>

        <p>
            Espera un momento. Puedes cancelar
            con el botón rojo.
        </p>
    `;

    explicacion.textContent = insertando
        ? "La tarjeta entra en el lector del cajero."
        : "Esta lectura es una animación. Después conectaremos " +
          "la identificación de tarjeta con Java.";

    ayudaTarjeta.textContent = "Tarjeta en el lector";
}

function mostrarIngresoPin() {
    contenido.innerHTML = `
        <h2>Ingresa tu PIN</h2>

        <p>
            Usa 4 dígitos ficticios y pulsa Aceptar.
        </p>

        <div
            class="pin"
            id="pinVisual"
            role="img"
            aria-label="0 de 4 dígitos ingresados"
        >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>

        <p
            class="mensaje"
            id="mensajePin"
            role="status"
        ></p>
    `;

    explicacion.textContent =
        "Usa el teclado del cajero o el de tu PC. " +
        "Corregir elimina un dígito; Escape cancela.";

    actualizarPin();
}

function mostrarEntradaCompletada() {
    contenido.innerHTML = `
        <span class="icono-pantalla" aria-hidden="true">
            ✓
        </span>

        <h2>Entrada completada</h2>

        <p>
            La interfaz está lista para conectarse con Java.
            Todavía no se ha autenticado la tarjeta.
        </p>

        <p class="mensaje">
            Pulsa Cancelar para devolver la tarjeta.
        </p>
    `;

    explicacion.textContent =
        "Se comprobó solamente la longitud del PIN y se borró " +
        "de la memoria de esta vista. El siguiente paso será " +
        "autenticarlo en Spring Boot.";
}

function mostrarDevolucion() {
    contenido.innerHTML = `
        <h2>Retira tu tarjeta</h2>

        <p>
            La simulación está finalizando.
        </p>
    `;

    explicacion.textContent =
        "La tarjeta vuelve a su posición inicial. " +
        "El PIN introducido se ha borrado.";

    ayudaTarjeta.textContent = "Devolviendo tarjeta…";
}


/* =====================================================
   5. INSERCIÓN DE LA TARJETA
   ===================================================== */

function insertarTarjeta() {
    if (estado !== "bienvenida") {
        return;
    }

    pin = "";

    mostrarEstado("insertando");

    // Espera a que termine la animación de entrada.
    programar(() => {
        mostrarEstado("leyendo");

        // Simula el tiempo necesario para leer la tarjeta.
        programar(() => {
            mostrarEstado("pin");
        }, 1400);

    }, 1250);
}


/* =====================================================
   6. INGRESO Y CORRECCIÓN DEL PIN
   ===================================================== */

function ingresarDigito(digito) {
    if (estado !== "pin" || pin.length >= 4) {
        return;
    }

    pin += digito;

    actualizarPin();
}

function actualizarPin() {
    const visual = document.getElementById("pinVisual");

    if (!visual) {
        return;
    }

    const casillas = [...visual.children];

    // Se muestran puntos, nunca los dígitos ingresados.
    casillas.forEach((casilla, indice) => {
        casilla.textContent = indice < pin.length
            ? "●"
            : "";
    });

    visual.setAttribute(
        "aria-label",
        `${pin.length} de 4 dígitos ingresados`
    );

    document.getElementById("mensajePin").textContent = "";
}

function corregirPin() {
    if (estado !== "pin") {
        return;
    }

    // Elimina el último carácter.
    pin = pin.slice(0, -1);

    actualizarPin();
}

function confirmarEntrada() {
    if (estado !== "pin") {
        return;
    }

    if (pin.length !== 4) {
        document.getElementById("mensajePin").textContent =
            "Ingresa los 4 dígitos para continuar.";

        return;
    }

    /*
       En esta versión solo validamos la longitud.

       Más adelante, aquí conectaremos la solicitud
       de autenticación con nuestro servidor Java.

       Por ahora no guardamos ni enviamos el PIN.
    */
    pin = "";

    mostrarEstado("preparado");
}


/* =====================================================
   7. CANCELACIÓN Y DEVOLUCIÓN
   ===================================================== */

function devolverTarjeta() {
    if (["bienvenida", "devolviendo"].includes(estado)) {
        return;
    }

    // Evita que una lectura pendiente vuelva a mostrar el PIN.
    clearTimeout(temporizador);

    pin = "";

    mostrarEstado("devolviendo");

    programar(() => {
        mostrarEstado("bienvenida");

        // Permite volver a comenzar usando el teclado.
        tarjeta.focus();
    }, 1300);
}


/* =====================================================
   8. EVENTOS DE LOS BOTONES
   ===================================================== */

tarjeta.addEventListener("click", insertarTarjeta);
cancelar.addEventListener("click", devolverTarjeta);
borrar.addEventListener("click", corregirPin);
aceptar.addEventListener("click", confirmarEntrada);

botonesNumericos.forEach((boton) => {
    boton.addEventListener("click", () => {
        ingresarDigito(boton.dataset.numero);
    });
});


/* =====================================================
   9. TECLADO DEL COMPUTADOR
   ===================================================== */

document.addEventListener("keydown", (evento) => {
    // Evita repeticiones y no interfiere con atajos del navegador.
    if (
        evento.repeat ||
        evento.ctrlKey ||
        evento.metaKey ||
        evento.altKey
    ) {
        return;
    }

    const esNumero = /^\d$/.test(evento.key);

    if (estado === "pin" && esNumero) {
        evento.preventDefault();

        ingresarDigito(evento.key);

    } else if (
        estado === "pin" &&
        evento.key === "Backspace"
    ) {
        evento.preventDefault();

        corregirPin();

    } else if (
        estado === "pin" &&
        evento.key === "Enter" &&
        evento.target.tagName !== "BUTTON"
    ) {
        /*
           Si un botón tiene el foco, Enter conserva su
           comportamiento normal: activar ese botón.
        */
        evento.preventDefault();

        confirmarEntrada();

    } else if (evento.key === "Escape") {
        devolverTarjeta();
    }
});


/* =====================================================
   10. RELOJ E INICIO
   ===================================================== */

function actualizarReloj() {
    const hora = new Date().toLocaleTimeString(
        "es-CL",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    document.getElementById("reloj").textContent = hora;
}

actualizarReloj();

setInterval(actualizarReloj, 30000);

mostrarEstado("bienvenida");