let sprintsMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    await cargarSprints();
    await cargarHistorias();
    inicializarEventos();
});

// 1. Cargar Sprints (desde sprints_ms:8002 o respaldo local si aún no está encendido)

async function cargarSprints() {

    let sprints = [];

    try {

        const respuesta = await apiRequest(
            `${API_CONFIG.SPRINTS_URL}/sprints`
        );

        if (!respuesta || respuesta.success !== true) {
            throw new Error('Respuesta inválida de sprints_ms.');
        }

        sprints = respuesta.data || [];

    } catch (error) {

        console.error('Error al cargar sprints:', error);

        mostrarAlerta(
            'No se pudieron cargar los sprints. Verifica que sprints_ms esté encendido.',
            'error'
        );

        return;
    }

    const filterSelect = document.getElementById('filter_sprint_id');
    const formSelect = document.getElementById('sprint_id');

    // Evitar duplicar opciones.
    filterSelect.innerHTML = '<option value="">Todos los Sprints</option>';
    formSelect.innerHTML = '<option value="">Seleccione un Sprint</option>';

    sprintsMap = {};

    sprints.forEach(sp => {

        sprintsMap[sp.id] = sp.nombre;

        const optFilter = document.createElement('option');
        optFilter.value = sp.id;
        optFilter.textContent = sp.nombre;

        filterSelect.appendChild(optFilter);

        const optForm = document.createElement('option');
        optForm.value = sp.id;
        optForm.textContent = sp.nombre;

        formSelect.appendChild(optForm);
    });
}

// 2. Obtener y renderizar historias desde historias_ms (puerto 8001)
async function cargarHistorias(sprintId = '') {
    try {
        const url = sprintId
            ? `${API_CONFIG.HISTORIAS_URL}/historias?sprint_id=${encodeURIComponent(sprintId)}`
            : `${API_CONFIG.HISTORIAS_URL}/historias`;

        const historias = await apiRequest(url);
        renderizarTabla(historias || []);
    } catch (error) {
        mostrarAlerta('No se pudo conectar con el microservicio de Historias (puerto 8001). Verifica que esté encendido.', 'error');
    }
}

function renderizarTabla(historias) {
    const tbody = document.getElementById('historias-tbody');
    const totalEl = document.getElementById('total-historias');
    const emptyMsg = document.getElementById('empty-message');
    const tableContainer = document.getElementById('table-container');

    totalEl.textContent = historias.length;
    tbody.innerHTML = '';

    if (historias.length === 0) {
        emptyMsg.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }

    emptyMsg.style.display = 'none';
    tableContainer.style.display = 'block';

    historias.forEach(h => {
        const tr = document.createElement('tr');
        const nombreSprint = sprintsMap[h.sprint_id] || `Sprint #${h.sprint_id}`;

        tr.innerHTML = `
            <td>
                <strong>${escaparHtml(h.titulo)}</strong>
                <div class="story-desc">${escaparHtml(h.descripcion || '')}</div>
            </td>
            <td>${escaparHtml(h.responsable)}</td>
            <td>${escaparHtml(nombreSprint)}</td>
            <td><strong>${parseInt(h.puntos, 10)} pts</strong></td>
            <td>${obtenerBadgeEstado(h.estado)}</td>
            <td class="story-dates">
                Inicio: ${escaparHtml(h.fecha_creacion || '-')}<br>
                ${h.fecha_finalizacion ? `Fin: ${escaparHtml(h.fecha_finalizacion)}` : ''}
            </td>
            <td>
                <div class="action-links">
                    <button type="button" class="btn-icon" title="Editar" onclick="editarHistoria(${h.id})">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button type="button" class="btn-icon delete" title="Eliminar" onclick="eliminarHistoria(${h.id})">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Eventos de filtro y formulario (Crear / Actualizar)
function inicializarEventos() {
    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const sprintId = document.getElementById('filter_sprint_id').value;
        cargarHistorias(sprintId);
    });

    document.getElementById('btn-nueva-historia').addEventListener('click', () => {
        limpiarFormulario();
        document.getElementById('form-title').textContent = 'Nueva Historia de Usuario';
        document.getElementById('form-section').style.display = 'block';
        document.getElementById('titulo').focus();
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => {
        limpiarFormulario();
        document.getElementById('form-section').style.display = 'none';
    });

    document.getElementById('historia-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('historia-id').value;
        const payload = {
            titulo: document.getElementById('titulo').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            responsable: document.getElementById('responsable').value.trim(),
            sprint_id: parseInt(document.getElementById('sprint_id').value, 10),
            puntos: parseInt(document.getElementById('puntos').value, 10),
            estado: document.getElementById('estado').value
        };

        try {
            if (id) {
                await apiRequest(`${API_CONFIG.HISTORIAS_URL}/historias/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                mostrarAlerta('Historia actualizada correctamente.', 'success');
            } else {
                await apiRequest(`${API_CONFIG.HISTORIAS_URL}/historias`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                mostrarAlerta('Historia creada exitosamente.', 'success');
            }

            limpiarFormulario();
            document.getElementById('form-section').style.display = 'none';
            const filtroActual = document.getElementById('filter_sprint_id').value;
            await cargarHistorias(filtroActual);
        } catch (error) {
            mostrarAlerta('Error al guardar la historia. Revisa los campos obligatorios.', 'error');
        }
    });
}

// 4. Cargar datos en el formulario para editar
async function editarHistoria(id) {
    try {
        const historia = await apiRequest(`${API_CONFIG.HISTORIAS_URL}/historias/${id}`);
        document.getElementById('historia-id').value = historia.id;
        document.getElementById('titulo').value = historia.titulo;
        document.getElementById('descripcion').value = historia.descripcion || '';
        document.getElementById('responsable').value = historia.responsable;
        document.getElementById('sprint_id').value = historia.sprint_id;
        document.getElementById('puntos').value = historia.puntos;
        document.getElementById('estado').value = historia.estado;

        document.getElementById('form-title').textContent = `Editar Historia #${historia.id}`;
        document.getElementById('form-section').style.display = 'block';
        document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarAlerta('No se pudo cargar la historia seleccionada.', 'error');
    }
}

// 5. Eliminar historia
async function eliminarHistoria(id) {
    if (!confirm('¿Estás segura de eliminar esta historia de usuario?')) {
        return;
    }

    try {
        await apiRequest(`${API_CONFIG.HISTORIAS_URL}/historias/${id}`, {
            method: 'DELETE'
        });
        mostrarAlerta('Historia eliminada correctamente.', 'success');
        const filtroActual = document.getElementById('filter_sprint_id').value;
        await cargarHistorias(filtroActual);
    } catch (error) {
        mostrarAlerta('Error al eliminar la historia.', 'error');
    }
}

// Utilidades visuales
function limpiarFormulario() {
    document.getElementById('historia-id').value = '';
    document.getElementById('historia-form').reset();
    document.getElementById('puntos').value = 3;
    document.getElementById('estado').value = 'nueva';
}

function obtenerBadgeEstado(estado) {
    switch (estado) {
        case 'finalizada':
            return '<span class="badge-status badge-finalizada">&#9679; Finalizada</span>';
        case 'activa':
            return '<span class="badge-status badge-activa">&#9654; Activa</span>';
        case 'impedimento':
            return '<span class="badge-status badge-impedimento">&#9888; Impedimento</span>';
        default:
            return '<span class="badge-status badge-nueva">&#10010; Nueva</span>';
    }
}

function mostrarAlerta(mensaje, tipo = 'success') {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = mensaje;
    alertBox.className = `alert-banner ${tipo === 'error' ? 'alert-error' : 'alert-success'}`;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 4000);
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}