document.addEventListener('DOMContentLoaded', () => {
    cargarTablero();
});

// Estados disponibles en el tablero
const estadosTablero = {
    nueva: {
        titulo: 'Nuevas',
        columna: 'columna-nueva',
        contador: 'contador-nueva'
    },

    activa: {
        titulo: 'Activas',
        columna: 'columna-activa',
        contador: 'contador-activa'
    },

    finalizada: {
        titulo: 'Finalizadas',
        columna: 'columna-finalizada',
        contador: 'contador-finalizada'
    },

    impedimento: {
        titulo: 'En impedimento',
        columna: 'columna-impedimento',
        contador: 'contador-impedimento'
    }
};

// Escapar caracteres HTML para evitar inyección de código
function escaparHtmlTablero(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter]);
}

// Mostrar mensajes de error
function mostrarErrorTablero(mensaje) {
    const alerta = document.getElementById('alert-box');

    if (alerta) {
        alerta.textContent = mensaje;
        alerta.hidden = false;
    }

    console.error(mensaje);
}

// Obtener el ID del sprint desde la URL
function obtenerIdSprint() {
    const parametros = new URLSearchParams(window.location.search);

    return parametros.get('id');
}

// Normalizar la respuesta del microservicio
function obtenerDatosSprint(respuesta) {
    if (!respuesta || respuesta.success !== true) {
        throw new Error(
            respuesta?.message || 'No fue posible obtener el sprint.'
        );
    }

    return respuesta.data;
}

// Obtener las historias, considerando respuestas directas o envueltas
function obtenerListaHistorias(respuesta) {
    if (Array.isArray(respuesta)) {
        return respuesta;
    }

    if (respuesta?.success === true && Array.isArray(respuesta.data)) {
        return respuesta.data;
    }

    throw new Error(
        respuesta?.message || 'El servicio de historias devolvió una respuesta inválida.'
    );
}

// Cargar toda la información del tablero
async function cargarTablero() {
    try {
        const idSprint = obtenerIdSprint();

        if (!idSprint || !/^\d+$/.test(idSprint)) {
            throw new Error('No se proporcionó un ID de sprint válido.');
        }

        // Consultar los dos microservicios
        const [respuestaSprint, respuestaHistorias] = await Promise.all([
            apiRequest(
                `${API_CONFIG.SPRINTS_URL}/sprints/${idSprint}`
            ),

            apiRequest(
                `${API_CONFIG.HISTORIAS_URL}/historias?sprint_id=${encodeURIComponent(idSprint)}`
            )
        ]);

        const sprint = obtenerDatosSprint(respuestaSprint);
        const historias = obtenerListaHistorias(respuestaHistorias);

        // Mostrar la información
        mostrarInformacionSprint(sprint);
        mostrarResumenTablero(historias);
        mostrarHistoriasPorEstado(historias);

    } catch (error) {
        console.error('Error al cargar el tablero:', error);

        mostrarErrorTablero(
            error.message || 'No fue posible cargar el tablero. Verifica los microservicios.'
        );
    }
}

// Mostrar nombre y fechas del sprint
function mostrarInformacionSprint(sprint) {
    document.title = `SprintFlow - Tablero: ${sprint.nombre}`;

    document.getElementById('sprint-nombre').textContent =
        sprint.nombre || 'Sprint sin nombre';

    document.getElementById('sprint-informacion').innerHTML = `
        Inicio: <strong>${escaparHtmlTablero(sprint.fecha_inicio)}</strong>
        &bull;
        Finalización: <strong>${escaparHtmlTablero(sprint.fecha_fin)}</strong>
    `;
}

// Calcular estadísticas generales
function mostrarResumenTablero(historias) {
    const totalHistorias = historias.length;

    const puntosTotales = historias.reduce((total, historia) => {
        return total + (Number(historia.puntos) || 0);
    }, 0);

    const finalizadas = historias.filter(
        historia => historia.estado === 'finalizada'
    ).length;

    document.getElementById('total-historias').textContent =
        totalHistorias;

    document.getElementById('puntos-totales').textContent =
        puntosTotales;

    document.getElementById('total-finalizadas').textContent =
        finalizadas;
}

// Agrupar y mostrar historias por estado
function mostrarHistoriasPorEstado(historias) {

    // Crear grupos vacíos
    const historiasPorEstado = {
        nueva: [],
        activa: [],
        finalizada: [],
        impedimento: []
    };

    // Clasificar las historias
    historias.forEach(historia => {
        const estado = historia.estado;

        if (historiasPorEstado[estado]) {
            historiasPorEstado[estado].push(historia);
        }
    });

    // Recorrer las columnas y mostrar sus historias
    Object.entries(estadosTablero).forEach(([estado, info]) => {

        const historiasEstado = historiasPorEstado[estado];

        const columna = document.getElementById(info.columna);
        const contador = document.getElementById(info.contador);

        contador.textContent = historiasEstado.length;

        if (historiasEstado.length === 0) {
            columna.innerHTML = `
                <p class="kanban-empty">Sin historias</p>
            `;
            return;
        }

        columna.innerHTML = historiasEstado
            .map(historia => crearTarjetaHistoria(historia))
            .join('');
    });
}

// Crear tarjeta individual de historia
function crearTarjetaHistoria(historia) {

    const id = Number(historia.id);

    return `
        <article class="kanban-card">

            <div class="kanban-card-header">
                <h4>${escaparHtmlTablero(historia.titulo)}</h4>

                <span class="points-badge">
                    ${Number(historia.puntos) || 0} pts
                </span>
            </div>

            <p class="kanban-card-desc">
                ${escaparHtmlTablero(historia.descripcion).replace(/\n/g, '<br>')}
            </p>

            <div class="kanban-card-meta">

                <span>
                    <strong>Resp:</strong>
                    ${escaparHtmlTablero(historia.responsable)}
                </span>

                <span>
                    Creada:
                    ${escaparHtmlTablero(historia.fecha_creacion)}
                </span>

                ${
                    historia.fecha_finalizacion
                    ? `
                        <span>
                            Fin:
                            ${escaparHtmlTablero(historia.fecha_finalizacion)}
                        </span>
                    `
                    : ''
                }

            </div>

            <div class="kanban-card-footer">
                ${
                    Number.isInteger(id) && id > 0
                    ? `
                        <a href="historias.html?id=${id}"
                           class="kanban-edit-link">
                            Editar estado / datos &rarr;
                        </a>
                    `
                    : ''
                }
            </div>

        </article>
    `;
}
