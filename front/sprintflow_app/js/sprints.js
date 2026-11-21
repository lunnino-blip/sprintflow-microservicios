document.addEventListener('DOMContentLoaded', () => {
    const formularioCrear = document.getElementById('sprint-create-form');
    const contenedor = document.getElementById('sprints-container');

    if (!formularioCrear || !contenedor) {
        console.error('No se encontraron los elementos necesarios en sprints.html.');
        return;
    }

    cargarSprints();

    formularioCrear.addEventListener('submit', crearSprint);

    // Delegación de eventos para los formularios y botones generados dinámicamente.
    contenedor.addEventListener('submit', async (event) => {
        const formulario = event.target;

        if (formulario.classList.contains('sprint-edit-form')) {
            event.preventDefault();
            await actualizarSprint(formulario);
        }
    });

    contenedor.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-eliminar-sprint');

        if (boton) {
            await eliminarSprint(boton.dataset.id);
        }
    });
});

function mostrarAlerta(mensaje, tipo = 'success') {
    const alerta = document.getElementById('alert-box');

    if (!alerta) {
        console.log(mensaje);
        return;
    }

    alerta.textContent = mensaje;
    alerta.className = `alert-banner alert-${tipo}`;
    alerta.hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escaparHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caracter]);
}

async function cargarSprints() {
    const contenedor = document.getElementById('sprints-container');
    const contador = document.getElementById('sprints-count');
    const vacio = document.getElementById('empty-message');

    try {
        const respuesta = await apiRequest(
            `${API_CONFIG.SPRINTS_URL}/sprints`
        );

        if (!respuesta || respuesta.success !== true) {
            throw new Error(respuesta?.message || 'No se pudieron obtener los sprints.');
        }

        const sprints = Array.isArray(respuesta.data) ? respuesta.data : [];

        contador.textContent = sprints.length;
        contenedor.innerHTML = '';

        if (sprints.length === 0) {
            vacio.hidden = false;
            return;
        }

        vacio.hidden = true;

        sprints.forEach(sprint => {
            contenedor.insertAdjacentHTML('beforeend', crearTarjetaSprint(sprint));
        });

    } catch (error) {
        console.error('Error al cargar sprints:', error);
        mostrarAlerta(error.message || 'No fue posible cargar los sprints.', 'error');
    }
}

function crearTarjetaSprint(sprint) {
    const id = Number(sprint.id);

    return `
        <article class="sprint-card">
            <div class="sprint-card-top">
                <div>
                    <h3>${escaparHtml(sprint.nombre)}</h3>
                    <p class="sprint-dates">
                        <span>Inicio: <strong>${escaparHtml(sprint.fecha_inicio)}</strong></span>
                        &bull;
                        <span>Fin: <strong>${escaparHtml(sprint.fecha_fin)}</strong></span>
                    </p>
                </div>

                <div class="sprint-card-actions">
                    <a href="tableros.html?id=${encodeURIComponent(id)}"
                       class="btn-primary btn-sm">
                        Ver tablero
                    </a>

                    <button type="button"
                            class="btn-danger btn-sm btn-eliminar-sprint"
                            data-id="${id}">
                        Eliminar
                    </button>
                </div>
            </div>

            <details class="sprint-edit-details">
                <summary class="sprint-edit-toggle">Editar datos del sprint</summary>

                <form class="sprint-edit-form">
                    <input type="hidden" name="id" value="${id}">

                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" name="nombre"
                               value="${escaparHtml(sprint.nombre)}"
                               maxlength="100" required>
                    </div>

                    <div class="form-group">
                        <label>Fecha de inicio:</label>
                        <input type="date" name="fecha_inicio"
                               value="${escaparHtml(sprint.fecha_inicio)}"
                               required>
                    </div>

                    <div class="form-group">
                        <label>Fecha de finalización:</label>
                        <input type="date" name="fecha_fin"
                               value="${escaparHtml(sprint.fecha_fin)}"
                               required>
                    </div>

                    <div class="form-group sprint-submit-group">
                        <button type="submit" class="btn-secondary btn-sm">
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </details>
        </article>
    `;
}

async function crearSprint(event) {
    event.preventDefault();

    const formulario = event.target;
    const datos = Object.fromEntries(new FormData(formulario));

    if (datos.fecha_inicio > datos.fecha_fin) {
        mostrarAlerta(
            'La fecha de inicio no puede ser posterior a la fecha de finalización.',
            'error'
        );
        return;
    }

    try {
        const respuesta = await apiRequest(
            `${API_CONFIG.SPRINTS_URL}/sprints`,
            {
                method: 'POST',
                body: JSON.stringify(datos)
            }
        );

        if (!respuesta || respuesta.success !== true) {
            throw new Error(respuesta?.message || 'No se pudo crear el sprint.');
        }

        formulario.reset();
        mostrarAlerta('Sprint creado correctamente.');
        await cargarSprints();

    } catch (error) {
        console.error('Error al crear sprint:', error);
        mostrarAlerta(error.message || 'Error al crear el sprint.', 'error');
    }
}

async function actualizarSprint(formulario) {
    const datos = Object.fromEntries(new FormData(formulario));
    const id = datos.id;

    delete datos.id;

    if (datos.fecha_inicio > datos.fecha_fin) {
        mostrarAlerta(
            'La fecha de inicio no puede ser posterior a la fecha de finalización.',
            'error'
        );
        return;
    }

    try {
        const respuesta = await apiRequest(
            `${API_CONFIG.SPRINTS_URL}/sprints/${encodeURIComponent(id)}`,
            {
                method: 'PUT',
                body: JSON.stringify(datos)
            }
        );

        if (!respuesta || respuesta.success !== true) {
            throw new Error(respuesta?.message || 'No se pudo actualizar el sprint.');
        }

        mostrarAlerta('Sprint actualizado correctamente.');
        await cargarSprints();

    } catch (error) {
        console.error('Error al actualizar sprint:', error);
        mostrarAlerta(error.message || 'Error al actualizar el sprint.', 'error');
    }
}

async function eliminarSprint(id) {
    if (!confirm(
        '¿Estás seguro de eliminar este sprint? Esta acción puede eliminar también las historias que tenga asignadas.'
    )) {
        return;
    }

    try {
        const respuesta = await apiRequest(
            `${API_CONFIG.SPRINTS_URL}/sprints/${encodeURIComponent(id)}`,
            { method: 'DELETE' }
        );

        if (!respuesta || respuesta.success !== true) {
            throw new Error(respuesta?.message || 'No se pudo eliminar el sprint.');
        }

        mostrarAlerta('Sprint eliminado correctamente.');
        await cargarSprints();

    } catch (error) {
        console.error('Error al eliminar sprint:', error);
        mostrarAlerta(error.message || 'Error al eliminar el sprint.', 'error');
    }
}
