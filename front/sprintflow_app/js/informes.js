document.addEventListener('DOMContentLoaded', () => {
    cargarInformes();
});

function escaparHtmlInforme(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter]);
}

function mostrarErrorInforme(mensaje) {
    const alerta = document.getElementById('alert-box');

    if (alerta) {
        alerta.textContent = mensaje;
        alerta.className = 'alert-banner alert-error';
        alerta.hidden = false;
    }

    console.error(mensaje);
}

function obtenerDatos(respuesta) {
    if (!respuesta || respuesta.success !== true) {
        throw new Error(respuesta?.message || 'El servicio de informes devolvió una respuesta inválida.');
    }

    return respuesta.data;
}

async function cargarInformes() {
    try {
        const [general, responsables, sprints] = await Promise.all([
            apiRequest(`${API_CONFIG.INFORMES_URL}/informes`),
            apiRequest(`${API_CONFIG.INFORMES_URL}/informes/responsables`),
            apiRequest(`${API_CONFIG.INFORMES_URL}/informes/sprints`)
        ]);

        const datosGenerales = obtenerDatos(general);
        const datosResponsables = obtenerDatos(responsables);
        const datosSprints = obtenerDatos(sprints);

        mostrarEstadisticasGenerales(datosGenerales);
        mostrarInformesResponsables(datosResponsables);
        mostrarInformesSprints(datosSprints);

    } catch (error) {
        console.error('Error al cargar informes:', error);
        mostrarErrorInforme(
            error.message || 'No fue posible obtener los informes. Verifica que los microservicios estén funcionando.'
        );
    }
}

function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? 0;
    }
}

function mostrarEstadisticasGenerales(datos) {
    establecerTexto('total-historias', datos.total_historias);
    establecerTexto('total-finalizadas', datos.finalizadas);
    establecerTexto('total-nuevas', datos.nuevas);
    establecerTexto('total-activas', datos.activas);
    establecerTexto('total-impedimentos', datos.impedimentos);
    establecerTexto('puntos-totales', datos.puntos_totales);

    const porcentaje = Number(datos.porcentaje_finalizacion) || 0;
    const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje));

    establecerTexto(
        'porcentaje-finalizacion',
        `${porcentajeSeguro.toFixed(1)}%`
    );

    const barra = document.getElementById('barra-finalizacion');

    if (barra) {
        barra.style.width = `${porcentajeSeguro}%`;
        barra.setAttribute('aria-valuenow', porcentajeSeguro);
    }
}

function mostrarInformesResponsables(responsables) {
    const tbody = document.getElementById('responsables-tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(responsables) || responsables.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">No hay datos de responsables disponibles.</td>
            </tr>
        `;
        return;
    }

    responsables.forEach(responsable => {
        const porcentaje = Number(responsable.porcentaje_finalizacion) || 0;
        const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje));

        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${escaparHtmlInforme(responsable.responsable)}</td>
                <td>${Number(responsable.total_historias) || 0}</td>
                <td>${Number(responsable.finalizadas) || 0}</td>
                <td>${Number(responsable.nuevas) || 0}</td>
                <td>${Number(responsable.activas) || 0}</td>
                <td>${Number(responsable.impedimentos) || 0}</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"
                                 style="width: ${porcentajeSeguro}%"></div>
                        </div>
                        <span>${porcentajeSeguro.toFixed(1)}%</span>
                    </div>
                </td>
            </tr>
        `);
    });
}

function mostrarInformesSprints(sprints) {
    const tbody = document.getElementById('sprints-tbody');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(sprints) || sprints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">No hay datos de sprints disponibles.</td>
            </tr>
        `;
        return;
    }

    sprints.forEach(sprint => {
        const porcentaje = Number(sprint.porcentaje_finalizacion) || 0;
        const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje));

        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${escaparHtmlInforme(sprint.nombre)}</td>
                <td>${escaparHtmlInforme(sprint.fecha_inicio)}</td>
                <td>${escaparHtmlInforme(sprint.fecha_fin)}</td>
                <td>${Number(sprint.total_historias) || 0}</td>
                <td>${Number(sprint.finalizadas) || 0}</td>
                <td>${Number(sprint.activas) || 0}</td>
                <td>${Number(sprint.impedimentos) || 0}</td>
                <td>${porcentajeSeguro.toFixed(1)}%</td>
            </tr>
        `);
    });
}
