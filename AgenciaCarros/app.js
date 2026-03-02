
const CONFIG = {
    API_BASE_URL: '/api',
    ITEMS_PER_PAGE: 12,
    MAX_COMPARACION: 4,
    IMAGEN_DEFAULT: '/images/auto-default.jpg',
    MONEDA: 'MXN',
    FORMATO_FECHA: 'es-MX'
};

const AppState = {
    usuario: null,
    vehiculos: [],
    vehiculosFiltrados: [],
    carroComparacion: [],
    cotizaciones: [],
    filtrosActivos: {},
    paginaActual: 1,
    cargando: false
};

/**
 * Formatea un número como moneda mexicana
 * @param {number} cantidad - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat(CONFIG.FORMATO_FECHA, {
        style: 'currency',
        currency: CONFIG.MONEDA
    }).format(cantidad);
};

/**
 * Formatea una fecha al formato local
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat(CONFIG.FORMATO_FECHA, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(fecha));
};

/**
 * Muestra una notificación al usuario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (exito, error, info, advertencia)
 */
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const contenedor = document.getElementById('notificaciones') || crearContenedorNotificaciones();
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <span class="notificacion-mensaje">${mensaje}</span>
        <button class="notificacion-cerrar" onclick="this.parentElement.remove()">×</button>
    `;
    
    contenedor.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('notificacion-salida');
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
};

/**
 * Crea el contenedor de notificaciones si no existe
 * @returns {HTMLElement} Contenedor de notificaciones
 */
const crearContenedorNotificaciones = () => {
    const contenedor = document.createElement('div');
    contenedor.id = 'notificaciones';
    contenedor.className = 'contenedor-notificaciones';
    document.body.appendChild(contenedor);
    return contenedor;
};

/**
 * Muestra u oculta el indicador de carga
 * @param {boolean} mostrar - Si se debe mostrar el loader
 */
const toggleLoader = (mostrar) => {
    AppState.cargando = mostrar;
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = mostrar ? 'flex' : 'none';
    }
};

/**
 * Realiza una petición HTTP con manejo de errores
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} opciones - Opciones de fetch
 * @returns {Promise<Object>} Respuesta de la API
 */
const fetchAPI = async (endpoint, opciones = {}) => {
    try {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...obtenerHeadersAutenticacion()
            },
            ...opciones
        };
        
        const respuesta = await fetch(url, config);
        
        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || `Error HTTP: ${respuesta.status}`);
        }
        
        return await respuesta.json();
    } catch (error) {
        console.error('Error en petición API:', error);
        throw error;
    }
};

/**
 * Obtiene los headers de autenticación si hay sesión activa
 * @returns {Object} Headers de autenticación
 */
const obtenerHeadersAutenticacion = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const Autenticacion = {
    /**
     * Inicia sesión del usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     */
    async iniciarSesion(email, password) {
        try {
            toggleLoader(true);
            const respuesta = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
            AppState.usuario = respuesta.usuario;
            
            this.actualizarUIUsuario();
            mostrarNotificacion('¡Bienvenido de vuelta!', 'exito');
            this.cerrarModalLogin();
            
        } catch (error) {
            mostrarNotificacion('Credenciales incorrectas', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    /**
     * Registra un nuevo usuario
     * @param {Object} datosUsuario - Datos del nuevo usuario
     */
    async registrar(datosUsuario) {
        try {
            toggleLoader(true);
            const respuesta = await fetchAPI('/auth/registro', {
                method: 'POST',
                body: JSON.stringify(datosUsuario)
            });
            
            mostrarNotificacion('Registro exitoso. Por favor inicia sesión.', 'exito');
            this.mostrarFormularioLogin();
            
        } catch (error) {
            mostrarNotificacion(error.message || 'Error en el registro', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        AppState.usuario = null;
        this.actualizarUIUsuario();
        mostrarNotificacion('Sesión cerrada correctamente', 'info');
    },
    
    verificarSesion() {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            AppState.usuario = JSON.parse(usuarioGuardado);
            this.actualizarUIUsuario();
        }
    },
    
    actualizarUIUsuario() {
        const btnLogin = document.getElementById('btn-login');
        const btnRegistro = document.getElementById('btn-registro');
        const menuUsuario = document.getElementById('menu-usuario');
        const nombreUsuario = document.getElementById('nombre-usuario');
        
        if (AppState.usuario) {
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnRegistro) btnRegistro.style.display = 'none';
            if (menuUsuario) menuUsuario.style.display = 'flex';
            if (nombreUsuario) nombreUsuario.textContent = AppState.usuario.nombre;
        } else {
            if (btnLogin) btnLogin.style.display = 'inline-block';
            if (btnRegistro) btnRegistro.style.display = 'inline-block';
            if (menuUsuario) menuUsuario.style.display = 'none';
        }
    },
    
    mostrarModalLogin() {
        const modal = document.getElementById('modal-auth');
        if (modal) {
            modal.style.display = 'flex';
            this.mostrarFormularioLogin();
        }
    },
    
    cerrarModalLogin() {
        const modal = document.getElementById('modal-auth');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    mostrarFormularioLogin() {
        const contenido = document.getElementById('contenido-auth');
        if (contenido) {
            contenido.innerHTML = `
                <h2>Iniciar Sesión</h2>
                <form id="form-login" class="formulario-auth">
                    <div class="campo-formulario">
                        <label for="login-email">Correo Electrónico</label>
                        <input type="email" id="login-email" required placeholder="tu@email.com">
                    </div>
                    <div class="campo-formulario">
                        <label for="login-password">Contraseña</label>
                        <input type="password" id="login-password" required placeholder="Tu contraseña">
                    </div>
                    <button type="submit" class="btn btn-primario btn-block">Iniciar Sesión</button>
                </form>
                <p class="texto-alternativa">
                    ¿No tienes cuenta? 
                    <a href="#" onclick="Autenticacion.mostrarFormularioRegistro()">Regístrate aquí</a>
                </p>
            `;
            
            document.getElementById('form-login').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                this.iniciarSesion(email, password);
            });
        }
    },
    
    mostrarFormularioRegistro() {
        const contenido = document.getElementById('contenido-auth');
        if (contenido) {
            contenido.innerHTML = `
                <h2>Crear Cuenta</h2>
                <form id="form-registro" class="formulario-auth">
                    <div class="campo-formulario">
                        <label for="registro-nombre">Nombre Completo</label>
                        <input type="text" id="registro-nombre" required placeholder="Tu nombre">
                    </div>
                    <div class="campo-formulario">
                        <label for="registro-email">Correo Electrónico</label>
                        <input type="email" id="registro-email" required placeholder="tu@email.com">
                    </div>
                    <div class="campo-formulario">
                        <label for="registro-telefono">Teléfono</label>
                        <input type="tel" id="registro-telefono" required placeholder="10 dígitos">
                    </div>
                    <div class="campo-formulario">
                        <label for="registro-password">Contraseña</label>
                        <input type="password" id="registro-password" required minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>
                    <div class="campo-formulario">
                        <label for="registro-confirmar">Confirmar Contraseña</label>
                        <input type="password" id="registro-confirmar" required placeholder="Repite tu contraseña">
                    </div>
                    <button type="submit" class="btn btn-primario btn-block">Crear Cuenta</button>
                </form>
                <p class="texto-alternativa">
                    ¿Ya tienes cuenta? 
                    <a href="#" onclick="Autenticacion.mostrarFormularioLogin()">Inicia sesión</a>
                </p>
            `;
            
            document.getElementById('form-registro').addEventListener('submit', (e) => {
                e.preventDefault();
                const password = document.getElementById('registro-password').value;
                const confirmar = document.getElementById('registro-confirmar').value;
                
                if (password !== confirmar) {
                    mostrarNotificacion('Las contraseñas no coinciden', 'error');
                    return;
                }
                
                this.registrar({
                    nombre: document.getElementById('registro-nombre').value,
                    email: document.getElementById('registro-email').value,
                    telefono: document.getElementById('registro-telefono').value,
                    password: password
                });
            });
        }
    }
};

const Catalogo = {
    async cargarVehiculos() {
        try {
            toggleLoader(true);
            const respuesta = await fetchAPI('/vehiculos');
            AppState.vehiculos = respuesta.vehiculos || respuesta;
            AppState.vehiculosFiltrados = [...AppState.vehiculos];
            this.renderizarCatalogo();
            this.cargarFiltros();
        } catch (error) {
            mostrarNotificacion('Error al cargar el catálogo', 'error');
            console.error('Error cargando vehículos:', error);
        } finally {
            toggleLoader(false);
        }
    },
    
    renderizarCatalogo() {
        const contenedor = document.getElementById('catalogo-vehiculos');
        if (!contenedor) return;
        
        const inicio = (AppState.paginaActual - 1) * CONFIG.ITEMS_PER_PAGE;
        const fin = inicio + CONFIG.ITEMS_PER_PAGE;
        const vehiculosPagina = AppState.vehiculosFiltrados.slice(inicio, fin);
        
        if (vehiculosPagina.length === 0) {
            contenedor.innerHTML = `
                <div class="catalogo-vacio">
                    <i class="icono-auto"></i>
                    <h3>No se encontraron vehículos</h3>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = vehiculosPagina.map(vehiculo => this.crearTarjetaVehiculo(vehiculo)).join('');
        this.renderizarPaginacion();
    },
    
    /**
     * Crea el HTML de una tarjeta de vehículo
     * @param {Object} vehiculo - Datos del vehículo
     * @returns {string} HTML de la tarjeta
     */
    crearTarjetaVehiculo(vehiculo) {
        const enComparacion = AppState.carroComparacion.some(v => v.id === vehiculo.id);
        const imagenPrincipal = vehiculo.imagenes?.[0] || CONFIG.IMAGEN_DEFAULT;
        
        return `
            <article class="tarjeta-vehiculo" data-id="${vehiculo.id}">
                <div class="tarjeta-imagen">
                    <img src="${imagenPrincipal}" alt="${vehiculo.marca} ${vehiculo.modelo}" 
                         onerror="this.src='${CONFIG.IMAGEN_DEFAULT}'" loading="lazy">
                    ${vehiculo.destacado ? '<span class="etiqueta-destacado">Destacado</span>' : ''}
                    ${vehiculo.nuevo ? '<span class="etiqueta-nuevo">Nuevo</span>' : ''}
                    <button class="btn-favorito" onclick="Catalogo.toggleFavorito(${vehiculo.id})" 
                            title="Agregar a favoritos">
                        <i class="icono-corazon"></i>
                    </button>
                </div>
                <div class="tarjeta-contenido">
                    <div class="tarjeta-header">
                        <h3 class="vehiculo-titulo">${vehiculo.marca} ${vehiculo.modelo}</h3>
                        <span class="vehiculo-año">${vehiculo.año}</span>
                    </div>
                    <p class="vehiculo-version">${vehiculo.version || ''}</p>
                    <div class="vehiculo-especificaciones">
                        <span><i class="icono-motor"></i> ${vehiculo.motor || 'N/A'}</span>
                        <span><i class="icono-transmision"></i> ${vehiculo.transmision || 'N/A'}</span>
                        <span><i class="icono-kilometraje"></i> ${vehiculo.kilometraje?.toLocaleString() || 0} km</span>
                    </div>
                    <div class="vehiculo-precio">
                        ${vehiculo.precioAnterior ? `<span class="precio-anterior">${formatearMoneda(vehiculo.precioAnterior)}</span>` : ''}
                        <span class="precio-actual">${formatearMoneda(vehiculo.precio)}</span>
                    </div>
                    <div class="tarjeta-acciones">
                        <button class="btn btn-secundario" onclick="Catalogo.verDetalle(${vehiculo.id})">
                            Ver Detalles
                        </button>
                        <button class="btn btn-outline ${enComparacion ? 'activo' : ''}" 
                                onclick="Comparador.toggleVehiculo(${vehiculo.id})"
                                title="${enComparacion ? 'Quitar de comparación' : 'Agregar a comparación'}">
                            <i class="icono-comparar"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    },
    
    async cargarFiltros() {
        try {
            const [marcas, tipos, años] = await Promise.all([
                fetchAPI('/vehiculos/marcas'),
                fetchAPI('/vehiculos/tipos'),
                fetchAPI('/vehiculos/años')
            ]);
            
            this.poblarSelectFiltro('filtro-marca', marcas);
            this.poblarSelectFiltro('filtro-tipo', tipos);
            this.poblarSelectFiltro('filtro-año', años);
            
        } catch (error) {
            // Usar datos locales si la API falla
            const marcasUnicas = [...new Set(AppState.vehiculos.map(v => v.marca))];
            const tiposUnicos = [...new Set(AppState.vehiculos.map(v => v.tipo))];
            const añosUnicos = [...new Set(AppState.vehiculos.map(v => v.año))].sort((a, b) => b - a);
            
            this.poblarSelectFiltro('filtro-marca', marcasUnicas);
            this.poblarSelectFiltro('filtro-tipo', tiposUnicos);
            this.poblarSelectFiltro('filtro-año', añosUnicos);
        }
    },
    
    /**
     * Pobla un select con opciones
     * @param {string} selectId - ID del select
     * @param {Array} opciones - Opciones a agregar
     */
    poblarSelectFiltro(selectId, opciones) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const opcionesHTML = opciones.map(opcion => 
            `<option value="${opcion}">${opcion}</option>`
        ).join('');
        
        select.innerHTML = `<option value="">Todos</option>${opcionesHTML}`;
    },
    
    aplicarFiltros() {
        const marca = document.getElementById('filtro-marca')?.value;
        const tipo = document.getElementById('filtro-tipo')?.value;
        const año = document.getElementById('filtro-año')?.value;
        const precioMin = parseFloat(document.getElementById('filtro-precio-min')?.value) || 0;
        const precioMax = parseFloat(document.getElementById('filtro-precio-max')?.value) || Infinity;
        const busqueda = document.getElementById('busqueda-vehiculo')?.value.toLowerCase() || '';
        
        AppState.filtrosActivos = { marca, tipo, año, precioMin, precioMax, busqueda };
        
        AppState.vehiculosFiltrados = AppState.vehiculos.filter(vehiculo => {
            const coincideMarca = !marca || vehiculo.marca === marca;
            const coincideTipo = !tipo || vehiculo.tipo === tipo;
            const coincideAño = !año || vehiculo.año.toString() === año;
            const coincidePrecio = vehiculo.precio >= precioMin && vehiculo.precio <= precioMax;
            const coincideBusqueda = !busqueda || 
                `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.version}`.toLowerCase().includes(busqueda);
            
            return coincideMarca && coincideTipo && coincideAño && coincidePrecio && coincideBusqueda;
        });
        
        AppState.paginaActual = 1;
        this.renderizarCatalogo();
        this.actualizarContadorResultados();
    },
    
    limpiarFiltros() {
        document.getElementById('filtro-marca')?.value && (document.getElementById('filtro-marca').value = '');
        document.getElementById('filtro-tipo')?.value && (document.getElementById('filtro-tipo').value = '');
        document.getElementById('filtro-año')?.value && (document.getElementById('filtro-año').value = '');
        document.getElementById('filtro-precio-min')?.value && (document.getElementById('filtro-precio-min').value = '');
        document.getElementById('filtro-precio-max')?.value && (document.getElementById('filtro-precio-max').value = '');
        document.getElementById('busqueda-vehiculo')?.value && (document.getElementById('busqueda-vehiculo').value = '');
        
        AppState.filtrosActivos = {};
        AppState.vehiculosFiltrados = [...AppState.vehiculos];
        AppState.paginaActual = 1;
        this.renderizarCatalogo();
        this.actualizarContadorResultados();
    },
    
    actualizarContadorResultados() {
        const contador = document.getElementById('contador-resultados');
        if (contador) {
            contador.textContent = `${AppState.vehiculosFiltrados.length} vehículos encontrados`;
        }
    },
    
    renderizarPaginacion() {
        const contenedor = document.getElementById('paginacion');
        if (!contenedor) return;
        
        const totalPaginas = Math.ceil(AppState.vehiculosFiltrados.length / CONFIG.ITEMS_PER_PAGE);
        
        if (totalPaginas <= 1) {
            contenedor.innerHTML = '';
            return;
        }
        
        let paginacionHTML = `
            <button class="btn-paginacion" ${AppState.paginaActual === 1 ? 'disabled' : ''} 
                    onclick="Catalogo.irAPagina(${AppState.paginaActual - 1})">
                &laquo; Anterior
            </button>
        `;
        
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= AppState.paginaActual - 2 && i <= AppState.paginaActual + 2)) {
                paginacionHTML += `
                    <button class="btn-paginacion ${i === AppState.paginaActual ? 'activo' : ''}" 
                            onclick="Catalogo.irAPagina(${i})">${i}</button>
                `;
            } else if (i === AppState.paginaActual - 3 || i === AppState.paginaActual + 3) {
                paginacionHTML += '<span class="paginacion-ellipsis">...</span>';
            }
        }
        
        paginacionHTML += `
            <button class="btn-paginacion" ${AppState.paginaActual === totalPaginas ? 'disabled' : ''} 
                    onclick="Catalogo.irAPagina(${AppState.paginaActual + 1})">
                Siguiente &raquo;
            </button>
        `;
        
        contenedor.innerHTML = paginacionHTML;
    },
    
    /**
     * Navega a una página específica
     * @param {number} pagina - Número de página
     */
    irAPagina(pagina) {
        const totalPaginas = Math.ceil(AppState.vehiculosFiltrados.length / CONFIG.ITEMS_PER_PAGE);
        if (pagina >= 1 && pagina <= totalPaginas) {
            AppState.paginaActual = pagina;
            this.renderizarCatalogo();
            document.getElementById('catalogo-vehiculos')?.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    /**
     * Muestra el detalle de un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    async verDetalle(vehiculoId) {
        try {
            toggleLoader(true);
            const vehiculo = await fetchAPI(`/vehiculos/${vehiculoId}`);
            this.mostrarModalDetalle(vehiculo);
        } catch (error) {
            // Buscar en datos locales si falla la API
            const vehiculo = AppState.vehiculos.find(v => v.id === vehiculoId);
            if (vehiculo) {
                this.mostrarModalDetalle(vehiculo);
            } else {
                mostrarNotificacion('Error al cargar los detalles del vehículo', 'error');
            }
        } finally {
            toggleLoader(false);
        }
    },
    
    /**
     * Muestra el modal con los detalles del vehículo
     * @param {Object} vehiculo - Datos del vehículo
     */
    mostrarModalDetalle(vehiculo) {
        const modal = document.getElementById('modal-detalle') || this.crearModalDetalle();
        const contenido = document.getElementById('contenido-detalle');
        
        if (contenido) {
            contenido.innerHTML = `
                <div class="detalle-vehiculo">
                    <div class="detalle-galeria">
                        ${Galeria.renderizar(vehiculo.imagenes || [CONFIG.IMAGEN_DEFAULT])}
                    </div>
                    <div class="detalle-info">
                        <div class="detalle-header">
                            <h2>${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.año}</h2>
                            <span class="detalle-version">${vehiculo.version || ''}</span>
                        </div>
                        
                        <div class="detalle-precio">
                            ${vehiculo.precioAnterior ? `<span class="precio-anterior">${formatearMoneda(vehiculo.precioAnterior)}</span>` : ''}
                            <span class="precio-actual">${formatearMoneda(vehiculo.precio)}</span>
                            ${vehiculo.precioAnterior ? `<span class="descuento">-${Math.round((1 - vehiculo.precio/vehiculo.precioAnterior) * 100)}%</span>` : ''}
                        </div>
                        
                        <div class="detalle-especificaciones">
                            <h3>Especificaciones</h3>
                            <div class="especificaciones-grid">
                                <div class="especificacion">
                                    <span class="etiqueta">Motor</span>
                                    <span class="valor">${vehiculo.motor || 'N/A'}</span>
                                </div>
                                <div class="especificacion">
                                    <span class="etiqueta">Transmisión</span>
                                    <span class="valor">${vehiculo.transmision || 'N/A'}</span>
                                </div>
                                <div class="especificacion">
                                    <span class="etiqueta">Kilometraje</span>
                                    <span class="valor">${vehiculo.kilometraje?.toLocaleString() || 0} km</span>
                                </div>
                                <div class="especificacion">
                                    <span class="etiqueta">Combustible</span>
                                    <span class="valor">${vehiculo.combustible || 'N/A'}</span>
                                </div>
                                <div class="especificacion">
                                    <span class="etiqueta">Color</span>
                                    <span class="valor">${vehiculo.color || 'N/A'}</span>
                                </div>
                                <div class="especificacion">
                                    <span class="etiqueta">Puertas</span>
                                    <span class="valor">${vehiculo.puertas || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${vehiculo.caracteristicas?.length ? `
                            <div class="detalle-caracteristicas">
                                <h3>Características</h3>
                                <ul class="lista-caracteristicas">
                                    ${vehiculo.caracteristicas.map(c => `<li><i class="icono-check"></i> ${c}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${vehiculo.descripcion ? `
                            <div class="detalle-descripcion">
                                <h3>Descripción</h3>
                                <p>${vehiculo.descripcion}</p>
                            </div>
                        ` : ''}
                        
                        <div class="detalle-acciones">
                            <button class="btn btn-primario btn-grande" onclick="Cotizaciones.iniciar(${vehiculo.id})">
                                <i class="icono-cotizacion"></i> Solicitar Cotización
                            </button>
                            <button class="btn btn-secundario btn-grande" onclick="Contacto.solicitarPruebaManejo(${vehiculo.id})">
                                <i class="icono-volante"></i> Prueba de Manejo
                            </button>
                            <button class="btn btn-outline" onclick="Comparador.toggleVehiculo(${vehiculo.id})">
                                <i class="icono-comparar"></i> Comparar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        modal.style.display = 'flex';
    },
    
    /**
     * Crea el modal de detalle si no existe
     * @returns {HTMLElement} Modal creado
     */
    crearModalDetalle() {
        const modal = document.createElement('div');
        modal.id = 'modal-detalle';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido modal-grande">
                <button class="modal-cerrar" onclick="Catalogo.cerrarModalDetalle()">×</button>
                <div id="contenido-detalle"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModalDetalle();
        });
        
        return modal;
    },
    
    cerrarModalDetalle() {
        const modal = document.getElementById('modal-detalle');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Alterna el estado de favorito de un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    async toggleFavorito(vehiculoId) {
        if (!AppState.usuario) {
            mostrarNotificacion('Inicia sesión para guardar favoritos', 'info');
            Autenticacion.mostrarModalLogin();
            return;
        }
        
        try {
            await fetchAPI(`/usuarios/favoritos/${vehiculoId}`, { method: 'POST' });
            mostrarNotificacion('Favorito actualizado', 'exito');
        } catch (error) {
            mostrarNotificacion('Error al actualizar favorito', 'error');
        }
    },
    
    /**
     * Ordena los vehículos según el criterio seleccionado
     * @param {string} criterio - Criterio de ordenamiento
     */
    ordenarPor(criterio) {
        const ordenamientos = {
            'precio-asc': (a, b) => a.precio - b.precio,
            'precio-desc': (a, b) => b.precio - a.precio,
            'año-desc': (a, b) => b.año - a.año,
            'año-asc': (a, b) => a.año - b.año,
            'km-asc': (a, b) => (a.kilometraje || 0) - (b.kilometraje || 0),
            'km-desc': (a, b) => (b.kilometraje || 0) - (a.kilometraje || 0),
            'nombre-asc': (a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`),
            'reciente': (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        };
        
        if (ordenamientos[criterio]) {
            AppState.vehiculosFiltrados.sort(ordenamientos[criterio]);
            this.renderizarCatalogo();
        }
    }
};

const Galeria = {
    imagenActual: 0,
    imagenes: [],
    
    /**
     * Renderiza la galería de imágenes
     * @param {Array} imagenes - Array de URLs de imágenes
     * @returns {string} HTML de la galería
     */
    renderizar(imagenes) {
        this.imagenes = imagenes;
        this.imagenActual = 0;
        
        return `
            <div class="galeria-principal">
                <div class="galeria-imagen-principal">
                    <img id="imagen-principal" src="${imagenes[0] || CONFIG.IMAGEN_DEFAULT}" 
                         alt="Imagen del vehículo" onclick="Galeria.abrirLightbox()">
                    ${imagenes.length > 1 ? `
                        <button class="galeria-nav galeria-prev" onclick="Galeria.anterior()">❮</button>
                        <button class="galeria-nav galeria-next" onclick="Galeria.siguiente()">❯</button>
                    ` : ''}
                </div>
                ${imagenes.length > 1 ? `
                    <div class="galeria-miniaturas">
                        ${imagenes.map((img, index) => `
                            <img src="${img}" alt="Miniatura ${index + 1}" 
                                 class="miniatura ${index === 0 ? 'activa' : ''}"
                                 onclick="Galeria.seleccionar(${index})"
                                 onerror="this.src='${CONFIG.IMAGEN_DEFAULT}'">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    /**
     * Selecciona una imagen específica
     * @param {number} index - Índice de la imagen
     */
    seleccionar(index) {
        this.imagenActual = index;
        const imagenPrincipal = document.getElementById('imagen-principal');
        const miniaturas = document.querySelectorAll('.miniatura');
        
        if (imagenPrincipal) {
            imagenPrincipal.src = this.imagenes[index];
        }
        
        miniaturas.forEach((miniatura, i) => {
            miniatura.classList.toggle('activa', i === index);
        });
    },
    
    anterior() {
        const nuevoIndex = this.imagenActual > 0 ? this.imagenActual - 1 : this.imagenes.length - 1;
        this.seleccionar(nuevoIndex);
    },
    
    siguiente() {
        const nuevoIndex = this.imagenActual < this.imagenes.length - 1 ? this.imagenActual + 1 : 0;
        this.seleccionar(nuevoIndex);
    },
    
    abrirLightbox() {
        const lightbox = document.getElementById('lightbox') || this.crearLightbox();
        const imagen = document.getElementById('lightbox-imagen');
        
        if (imagen) {
            imagen.src = this.imagenes[this.imagenActual];
        }
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    cerrarLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    },
    
    /**
     * Crea el lightbox si no existe
     * @returns {HTMLElement} Lightbox creado
     */
    crearLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-cerrar" onclick="Galeria.cerrarLightbox()">×</button>
            <button class="lightbox-nav lightbox-prev" onclick="Galeria.anterior(); Galeria.actualizarLightbox()">❮</button>
            <img id="lightbox-imagen" src="" alt="Imagen ampliada">
            <button class="lightbox-nav lightbox-next" onclick="Galeria.siguiente(); Galeria.actualizarLightbox()">❯</button>
            <div class="lightbox-contador">
                <span id="lightbox-actual">1</span> / <span id="lightbox-total">1</span>
            </div>
        `;
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.cerrarLightbox();
        });
        
        document.body.appendChild(lightbox);
        return lightbox;
    },
    
    actualizarLightbox() {
        const imagen = document.getElementById('lightbox-imagen');
        const actual = document.getElementById('lightbox-actual');
        
        if (imagen) imagen.src = this.imagenes[this.imagenActual];
        if (actual) actual.textContent = this.imagenActual + 1;
    }
};

const Comparador = {
    /**
     * Agrega o quita un vehículo de la comparación
     * @param {number} vehiculoId - ID del vehículo
     */
    toggleVehiculo(vehiculoId) {
        const vehiculo = AppState.vehiculos.find(v => v.id === vehiculoId);
        if (!vehiculo) return;
        
        const indice = AppState.carroComparacion.findIndex(v => v.id === vehiculoId);
        
        if (indice >= 0) {
            AppState.carroComparacion.splice(indice, 1);
            mostrarNotificacion('Vehículo removido de la comparación', 'info');
        } else {
            if (AppState.carroComparacion.length >= CONFIG.MAX_COMPARACION) {
                mostrarNotificacion(`Máximo ${CONFIG.MAX_COMPARACION} vehículos en comparación`, 'advertencia');
                return;
            }
            AppState.carroComparacion.push(vehiculo);
            mostrarNotificacion('Vehículo agregado a la comparación', 'exito');
        }
        
        this.actualizarIndicador();
        this.guardarEnStorage();
        Catalogo.renderizarCatalogo();
    },

    actualizarIndicador() {
        const indicador = document.getElementById('comparador-indicador');
        const contador = document.getElementById('comparador-contador');
        
        if (indicador) {
            indicador.style.display = AppState.carroComparacion.length > 0 ? 'flex' : 'none';
        }
        
        if (contador) {
            contador.textContent = AppState.carroComparacion.length;
        }
    },
    
    guardarEnStorage() {
        localStorage.setItem('comparacion', JSON.stringify(AppState.carroComparacion.map(v => v.id)));
    },
    
    cargarDesdeStorage() {
        const ids = JSON.parse(localStorage.getItem('comparacion') || '[]');
        AppState.carroComparacion = AppState.vehiculos.filter(v => ids.includes(v.id));
        this.actualizarIndicador();
    },
    
    mostrarComparacion() {
        if (AppState.carroComparacion.length < 2) {
            mostrarNotificacion('Agrega al menos 2 vehículos para comparar', 'advertencia');
            return;
        }
        
        const modal = document.getElementById('modal-comparacion') || this.crearModalComparacion();
        const contenido = document.getElementById('contenido-comparacion');
        
        if (contenido) {
            contenido.innerHTML = this.generarTablaComparacion();
        }
        
        modal.style.display = 'flex';
    },
    
    /**
     * Genera el HTML de la tabla de comparación
     * @returns {string} HTML de la tabla
     */
    generarTablaComparacion() {
        const vehiculos = AppState.carroComparacion;
        const caracteristicas = [
            { clave: 'precio', etiqueta: 'Precio', formato: formatearMoneda },
            { clave: 'año', etiqueta: 'Año' },
            { clave: 'motor', etiqueta: 'Motor' },
            { clave: 'transmision', etiqueta: 'Transmisión' },
            { clave: 'combustible', etiqueta: 'Combustible' },
            { clave: 'kilometraje', etiqueta: 'Kilometraje', formato: (v) => `${v?.toLocaleString() || 0} km` },
            { clave: 'potencia', etiqueta: 'Potencia' },
            { clave: 'color', etiqueta: 'Color' },
            { clave: 'puertas', etiqueta: 'Puertas' }
        ];
        
        return `
            <div class="tabla-comparacion-container">
                <table class="tabla-comparacion">
                    <thead>
                        <tr>
                            <th>Característica</th>
                            ${vehiculos.map(v => `
                                <th>
                                    <div class="comparacion-header">
                                        <img src="${v.imagenes?.[0] || CONFIG.IMAGEN_DEFAULT}" alt="${v.marca} ${v.modelo}">
                                        <h4>${v.marca} ${v.modelo}</h4>
                                        <span>${v.año}</span>
                                        <button class="btn-quitar" onclick="Comparador.toggleVehiculo(${v.id}); Comparador.mostrarComparacion();">
                                            Quitar
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${caracteristicas.map(({ clave, etiqueta, formato }) => `
                            <tr>
                                <td class="caracteristica-etiqueta">${etiqueta}</td>
                                ${vehiculos.map(v => {
                                    const valor = v[clave];
                                    const valorFormateado = formato ? formato(valor) : (valor || 'N/A');
                                    return `<td>${valorFormateado}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="comparacion-acciones">
                <button class="btn btn-secundario" onclick="Comparador.limpiar()">
                    Limpiar Comparación
                </button>
                <button class="btn btn-primario" onclick="Comparador.exportarPDF()">
                    Exportar PDF
                </button>
            </div>
        `;
    },
    
    /**
     * Crea el modal de comparación si no existe
     * @returns {HTMLElement} Modal creado
     */
    crearModalComparacion() {
        const modal = document.createElement('div');
        modal.id = 'modal-comparacion';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido modal-extra-grande">
                <button class="modal-cerrar" onclick="Comparador.cerrarModal()">×</button>
                <h2>Comparación de Vehículos</h2>
                <div id="contenido-comparacion"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModal();
        });
        
        return modal;
    },
    
    /**
     * Cierra el modal de comparación
     */
    cerrarModal() {
        const modal = document.getElementById('modal-comparacion');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Limpia todos los vehículos de la comparación
     */
    limpiar() {
        AppState.carroComparacion = [];
        this.actualizarIndicador();
        this.guardarEnStorage();
        this.cerrarModal();
        Catalogo.renderizarCatalogo();
        mostrarNotificacion('Comparación limpiada', 'info');
    },
    
    async exportarPDF() {
        try {
            toggleLoader(true);
            const ids = AppState.carroComparacion.map(v => v.id);
            const respuesta = await fetchAPI('/comparacion/pdf', {
                method: 'POST',
                body: JSON.stringify({ vehiculoIds: ids })
            });
            
            const link = document.createElement('a');
            link.href = respuesta.url;
            link.download = 'comparacion-vehiculos.pdf';
            link.click();
            
            mostrarNotificacion('PDF generado correctamente', 'exito');
        } catch (error) {
            mostrarNotificacion('Error al generar el PDF', 'error');
        } finally {
            toggleLoader(false);
        }
    }
};

const Cotizaciones = {
    vehiculoActual: null,
    
    /**
     * Inicia el proceso de cotización para un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    async iniciar(vehiculoId) {
        const vehiculo = AppState.vehiculos.find(v => v.id === vehiculoId);
        if (!vehiculo) {
            mostrarNotificacion('Vehículo no encontrado', 'error');
            return;
        }
        
        this.vehiculoActual = vehiculo;
        this.mostrarFormulario();
    },
    
    mostrarFormulario() {
        const modal = document.getElementById('modal-cotizacion') || this.crearModalCotizacion();
        const contenido = document.getElementById('contenido-cotizacion');
        
        const vehiculo = this.vehiculoActual;
        
        if (contenido) {
            contenido.innerHTML = `
                <div class="cotizacion-vehiculo">
                    <img src="${vehiculo.imagenes?.[0] || CONFIG.IMAGEN_DEFAULT}" alt="${vehiculo.marca} ${vehiculo.modelo}">
                    <div class="cotizacion-vehiculo-info">
                        <h3>${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.año}</h3>
                        <p class="precio">${formatearMoneda(vehiculo.precio)}</p>
                    </div>
                </div>
                
                <form id="form-cotizacion" class="formulario-cotizacion">
                    <h3>Datos de Contacto</h3>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="cot-nombre">Nombre Completo *</label>
                            <input type="text" id="cot-nombre" required 
                                   value="${AppState.usuario?.nombre || ''}"
                                   placeholder="Tu nombre completo">
                        </div>
                        <div class="campo-formulario">
                            <label for="cot-email">Correo Electrónico *</label>
                            <input type="email" id="cot-email" required 
                                   value="${AppState.usuario?.email || ''}"
                                   placeholder="tu@email.com">
                        </div>
                    </div>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="cot-telefono">Teléfono *</label>
                            <input type="tel" id="cot-telefono" required 
                                   value="${AppState.usuario?.telefono || ''}"
                                   pattern="[0-9]{10}" placeholder="10 dígitos">
                        </div>
                        <div class="campo-formulario">
                            <label for="cot-ciudad">Ciudad</label>
                            <input type="text" id="cot-ciudad" placeholder="Tu ciudad">
                        </div>
                    </div>
                    
                    <h3>Opciones de Financiamiento</h3>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="cot-enganche">Enganche (%)</label>
                            <input type="number" id="cot-enganche" min="10" max="100" value="20"
                                   onchange="Cotizaciones.calcularFinanciamiento()">
                        </div>
                        <div class="campo-formulario">
                            <label for="cot-plazo">Plazo (meses)</label>
                            <select id="cot-plazo" onchange="Cotizaciones.calcularFinanciamiento()">
                                <option value="12">12 meses</option>
                                <option value="24">24 meses</option>
                                <option value="36" selected>36 meses</option>
                                <option value="48">48 meses</option>
                                <option value="60">60 meses</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="resumen-financiamiento" id="resumen-financiamiento">
                        <!-- Se llena dinámicamente -->
                    </div>
                    
                    <div class="campo-formulario">
                        <label for="cot-comentarios">Comentarios Adicionales</label>
                        <textarea id="cot-comentarios" rows="3" 
                                  placeholder="¿Tienes alguna pregunta o solicitud especial?"></textarea>
                    </div>
                    
                    <div class="campo-formulario campo-checkbox">
                        <label>
                            <input type="checkbox" id="cot-acepto" required>
                            Acepto recibir información y ser contactado por un asesor
                        </label>
                    </div>
                    
                    <div class="formulario-acciones">
                        <button type="button" class="btn btn-secundario" onclick="Cotizaciones.cerrarModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primario">
                            Solicitar Cotización
                        </button>
                    </div>
                </form>
            `;
            
            this.calcularFinanciamiento();
            
            document.getElementById('form-cotizacion').addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviar();
            });
        }
        
        modal.style.display = 'flex';
    },
    
    calcularFinanciamiento() {
        if (!this.vehiculoActual) return;
        
        const precio = this.vehiculoActual.precio;
        const enganche = parseFloat(document.getElementById('cot-enganche')?.value || 20) / 100;
        const plazo = parseInt(document.getElementById('cot-plazo')?.value || 36);
        const tasaAnual = 0.12; 
        const tasaMensual = tasaAnual / 12;
        
        const montoEnganche = precio * enganche;
        const montoFinanciar = precio - montoEnganche;
        
        const pagoMensual = montoFinanciar * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / 
                           (Math.pow(1 + tasaMensual, plazo) - 1);
        
        const totalPagar = montoEnganche + (pagoMensual * plazo);
        
        const resumen = document.getElementById('resumen-financiamiento');
        if (resumen) {
            resumen.innerHTML = `
                <h4>Estimación de Financiamiento</h4>
                <div class="financiamiento-detalles">
                    <div class="financiamiento-item">
                        <span>Precio del vehículo:</span>
                        <strong>${formatearMoneda(precio)}</strong>
                    </div>
                    <div class="financiamiento-item">
                        <span>Enganche (${enganche * 100}%):</span>
                        <strong>${formatearMoneda(montoEnganche)}</strong>
                    </div>
                    <div class="financiamiento-item">
                        <span>Monto a financiar:</span>
                        <strong>${formatearMoneda(montoFinanciar)}</strong>
                    </div>
                    <div class="financiamiento-item destacado">
                        <span>Pago mensual estimado:</span>
                        <strong>${formatearMoneda(pagoMensual)}</strong>
                    </div>
                    <div class="financiamiento-item">
                        <span>Total a pagar:</span>
                        <strong>${formatearMoneda(totalPagar)}</strong>
                    </div>
                </div>
                <p class="nota">* Los valores son estimados. La cotización final puede variar según el análisis crediticio.</p>
            `;
        }
    },
    
    async enviar() {
        const datos = {
            vehiculoId: this.vehiculoActual.id,
            nombre: document.getElementById('cot-nombre').value,
            email: document.getElementById('cot-email').value,
            telefono: document.getElementById('cot-telefono').value,
            ciudad: document.getElementById('cot-ciudad').value,
            enganche: document.getElementById('cot-enganche').value,
            plazo: document.getElementById('cot-plazo').value,
            comentarios: document.getElementById('cot-comentarios').value
        };
        
        if (!Validaciones.email(datos.email)) {
            mostrarNotificacion('Por favor ingresa un correo válido', 'error');
            return;
        }
        
        if (!Validaciones.telefono(datos.telefono)) {
            mostrarNotificacion('Por favor ingresa un teléfono válido de 10 dígitos', 'error');
            return;
        }
        
        try {
            toggleLoader(true);
            await fetchAPI('/cotizaciones', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
            
            mostrarNotificacion('¡Cotización enviada! Un asesor te contactará pronto.', 'exito');
            this.cerrarModal();
            
        } catch (error) {
            mostrarNotificacion('Error al enviar la cotización. Intenta de nuevo.', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    /**
     * Crea el modal de cotización si no existe
     * @returns {HTMLElement} Modal creado
     */
    crearModalCotizacion() {
        const modal = document.createElement('div');
        modal.id = 'modal-cotizacion';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido modal-grande">
                <button class="modal-cerrar" onclick="Cotizaciones.cerrarModal()">×</button>
                <h2>Solicitar Cotización</h2>
                <div id="contenido-cotizacion"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModal();
        });
        
        return modal;
    },
    
    cerrarModal() {
        const modal = document.getElementById('modal-cotizacion');
        if (modal) {
            modal.style.display = 'none';
        }
        this.vehiculoActual = null;
    },
    
    async cargarMisCotizaciones() {
        if (!AppState.usuario) {
            mostrarNotificacion('Inicia sesión para ver tus cotizaciones', 'info');
            return;
        }
        
        try {
            toggleLoader(true);
            const respuesta = await fetchAPI('/usuarios/cotizaciones');
            AppState.cotizaciones = respuesta.cotizaciones || respuesta;
            this.mostrarHistorial();
        } catch (error) {
            mostrarNotificacion('Error al cargar las cotizaciones', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    mostrarHistorial() {
        const contenedor = document.getElementById('historial-cotizaciones');
        if (!contenedor) return;
        
        if (AppState.cotizaciones.length === 0) {
            contenedor.innerHTML = `
                <div class="historial-vacio">
                    <p>No tienes cotizaciones aún</p>
                    <a href="#catalogo" class="btn btn-primario">Explorar Catálogo</a>
                </div>
            `;
            return;
        }
        
        contenedor.innerHTML = AppState.cotizaciones.map(cot => `
            <div class="tarjeta-cotizacion">
                <div class="cotizacion-info">
                    <h4>${cot.vehiculo?.marca} ${cot.vehiculo?.modelo}</h4>
                    <p>Fecha: ${formatearFecha(cot.fecha)}</p>
                    <span class="estado estado-${cot.estado}">${cot.estado}</span>
                </div>
                <div class="cotizacion-precio">
                    ${formatearMoneda(cot.vehiculo?.precio)}
                </div>
            </div>
        `).join('');
    }
};

const Contacto = {
    mostrarFormulario() {
        const modal = document.getElementById('modal-contacto') || this.crearModalContacto();
        const contenido = document.getElementById('contenido-contacto');
        
        if (contenido) {
            contenido.innerHTML = `
                <form id="form-contacto" class="formulario-contacto">
                    <div class="campo-formulario">
                        <label for="contacto-nombre">Nombre Completo *</label>
                        <input type="text" id="contacto-nombre" required 
                               value="${AppState.usuario?.nombre || ''}"
                               placeholder="Tu nombre">
                    </div>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="contacto-email">Correo Electrónico *</label>
                            <input type="email" id="contacto-email" required 
                                   value="${AppState.usuario?.email || ''}"
                                   placeholder="tu@email.com">
                        </div>
                        <div class="campo-formulario">
                            <label for="contacto-telefono">Teléfono *</label>
                            <input type="tel" id="contacto-telefono" required 
                                   value="${AppState.usuario?.telefono || ''}"
                                   pattern="[0-9]{10}" placeholder="10 dígitos">
                        </div>
                    </div>
                    
                    <div class="campo-formulario">
                        <label for="contacto-asunto">Asunto *</label>
                        <select id="contacto-asunto" required>
                            <option value="">Selecciona un asunto</option>
                            <option value="informacion">Información general</option>
                            <option value="cotizacion">Cotización</option>
                            <option value="financiamiento">Financiamiento</option>
                            <option value="servicio">Servicio técnico</option>
                            <option value="queja">Queja o sugerencia</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    
                    <div class="campo-formulario">
                        <label for="contacto-mensaje">Mensaje *</label>
                        <textarea id="contacto-mensaje" rows="5" required 
                                  placeholder="Escribe tu mensaje..."></textarea>
                    </div>
                    
                    <div class="campo-formulario campo-checkbox">
                        <label>
                            <input type="checkbox" id="contacto-privacidad" required>
                            Acepto el <a href="/privacidad" target="_blank">aviso de privacidad</a>
                        </label>
                    </div>
                    
                    <div class="formulario-acciones">
                        <button type="button" class="btn btn-secundario" onclick="Contacto.cerrarModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primario">
                            Enviar Mensaje
                        </button>
                    </div>
                </form>
            `;
            
            document.getElementById('form-contacto').addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarMensaje();
            });
        }
        
        modal.style.display = 'flex';
    },
    
    async enviarMensaje() {
        const datos = {
            nombre: document.getElementById('contacto-nombre').value,
            email: document.getElementById('contacto-email').value,
            telefono: document.getElementById('contacto-telefono').value,
            asunto: document.getElementById('contacto-asunto').value,
            mensaje: document.getElementById('contacto-mensaje').value
        };
        
        if (!Validaciones.email(datos.email)) {
            mostrarNotificacion('Por favor ingresa un correo válido', 'error');
            return;
        }
        
        try {
            toggleLoader(true);
            await fetchAPI('/contacto', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
            
            mostrarNotificacion('Mensaje enviado correctamente', 'exito');
            this.cerrarModal();
            
        } catch (error) {
            mostrarNotificacion('Error al enviar el mensaje', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    /**
     * Muestra el formulario para solicitar prueba de manejo
     * @param {number} vehiculoId - ID del vehículo
     */
    solicitarPruebaManejo(vehiculoId) {
        const vehiculo = AppState.vehiculos.find(v => v.id === vehiculoId);
        if (!vehiculo) {
            mostrarNotificacion('Vehículo no encontrado', 'error');
            return;
        }
        
        const modal = document.getElementById('modal-prueba') || this.crearModalPrueba();
        const contenido = document.getElementById('contenido-prueba');
        
        if (contenido) {
            contenido.innerHTML = `
                <div class="prueba-vehiculo">
                    <img src="${vehiculo.imagenes?.[0] || CONFIG.IMAGEN_DEFAULT}" alt="${vehiculo.marca} ${vehiculo.modelo}">
                    <div>
                        <h3>${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.año}</h3>
                        <p>${vehiculo.version || ''}</p>
                    </div>
                </div>
                
                <form id="form-prueba" class="formulario-prueba">
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="prueba-nombre">Nombre Completo *</label>
                            <input type="text" id="prueba-nombre" required 
                                   value="${AppState.usuario?.nombre || ''}">
                        </div>
                        <div class="campo-formulario">
                            <label for="prueba-email">Correo Electrónico *</label>
                            <input type="email" id="prueba-email" required 
                                   value="${AppState.usuario?.email || ''}">
                        </div>
                    </div>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="prueba-telefono">Teléfono *</label>
                            <input type="tel" id="prueba-telefono" required 
                                   value="${AppState.usuario?.telefono || ''}"
                                   pattern="[0-9]{10}">
                        </div>
                        <div class="campo-formulario">
                            <label for="prueba-licencia">Número de Licencia *</label>
                            <input type="text" id="prueba-licencia" required 
                                   placeholder="Número de tu licencia de conducir">
                        </div>
                    </div>
                    
                    <div class="fila-formulario">
                        <div class="campo-formulario">
                            <label for="prueba-fecha">Fecha Preferida *</label>
                            <input type="date" id="prueba-fecha" required 
                                   min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="campo-formulario">
                            <label for="prueba-hora">Hora Preferida *</label>
                            <select id="prueba-hora" required>
                                <option value="">Selecciona</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="campo-formulario">
                        <label for="prueba-sucursal">Sucursal *</label>
                        <select id="prueba-sucursal" required>
                            <option value="">Selecciona una sucursal</option>
                            <option value="centro">Sucursal Centro</option>
                            <option value="norte">Sucursal Norte</option>
                            <option value="sur">Sucursal Sur</option>
                        </select>
                    </div>
                    
                    <div class="campo-formulario">
                        <label for="prueba-comentarios">Comentarios adicionales</label>
                        <textarea id="prueba-comentarios" rows="3" 
                                  placeholder="¿Algo que debamos saber?"></textarea>
                    </div>
                    
                    <div class="campo-formulario campo-checkbox">
                        <label>
                            <input type="checkbox" id="prueba-terminos" required>
                            Confirmo que tengo licencia de conducir vigente y acepto los 
                            <a href="/terminos-prueba" target="_blank">términos y condiciones</a>
                        </label>
                    </div>
                    
                    <input type="hidden" id="prueba-vehiculo-id" value="${vehiculoId}">
                    
                    <div class="formulario-acciones">
                        <button type="button" class="btn btn-secundario" onclick="Contacto.cerrarModalPrueba()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primario">
                            Solicitar Prueba
                        </button>
                    </div>
                </form>
            `;
            
            document.getElementById('form-prueba').addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarSolicitudPrueba();
            });
        }
        
        modal.style.display = 'flex';
    },
    
    async enviarSolicitudPrueba() {
        const datos = {
            vehiculoId: document.getElementById('prueba-vehiculo-id').value,
            nombre: document.getElementById('prueba-nombre').value,
            email: document.getElementById('prueba-email').value,
            telefono: document.getElementById('prueba-telefono').value,
            licencia: document.getElementById('prueba-licencia').value,
            fecha: document.getElementById('prueba-fecha').value,
            hora: document.getElementById('prueba-hora').value,
            sucursal: document.getElementById('prueba-sucursal').value,
            comentarios: document.getElementById('prueba-comentarios').value
        };
        
        if (!Validaciones.email(datos.email)) {
            mostrarNotificacion('Por favor ingresa un correo válido', 'error');
            return;
        }
        
        try {
            toggleLoader(true);
            await fetchAPI('/pruebas-manejo', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
            
            mostrarNotificacion('¡Solicitud enviada! Te confirmaremos por correo.', 'exito');
            this.cerrarModalPrueba();
            
        } catch (error) {
            mostrarNotificacion('Error al enviar la solicitud', 'error');
        } finally {
            toggleLoader(false);
        }
    },
    
    /**
     * Crea el modal de contacto
     * @returns {HTMLElement} Modal creado
     */
    crearModalContacto() {
        const modal = document.createElement('div');
        modal.id = 'modal-contacto';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido">
                <button class="modal-cerrar" onclick="Contacto.cerrarModal()">×</button>
                <h2>Contáctanos</h2>
                <div id="contenido-contacto"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModal();
        });
        
        return modal;
    },
    
    /**
     * Crea el modal de prueba de manejo
     * @returns {HTMLElement} Modal creado
     */
    crearModalPrueba() {
        const modal = document.createElement('div');
        modal.id = 'modal-prueba';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido modal-grande">
                <button class="modal-cerrar" onclick="Contacto.cerrarModalPrueba()">×</button>
                <h2>Solicitar Prueba de Manejo</h2>
                <div id="contenido-prueba"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModalPrueba();
        });
        
        return modal;
    },
    
    cerrarModal() {
        const modal = document.getElementById('modal-contacto');
        if (modal) modal.style.display = 'none';
    },
    
    cerrarModalPrueba() {
        const modal = document.getElementById('modal-prueba');
        if (modal) modal.style.display = 'none';
    }
};

const Validaciones = {
    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    /**
     * Valida formato de teléfono mexicano
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} True si es válido
     */
    telefono(telefono) {
        const regex = /^[0-9]{10}$/;
        return regex.test(telefono.replace(/\D/g, ''));
    },
    
    /**
     * Valida que un campo no esté vacío
     * @param {string} valor - Valor a validar
     * @returns {boolean} True si no está vacío
     */
    requerido(valor) {
        return valor !== null && valor !== undefined && valor.toString().trim() !== '';
    },
    
    /**
     * Valida longitud mínima
     * @param {string} valor - Valor a validar
     * @param {number} min - Longitud mínima
     * @returns {boolean} True si cumple
     */
    longitudMinima(valor, min) {
        return valor && valor.length >= min;
    },
    
    /**
     * Valida longitud máxima
     * @param {string} valor - Valor a validar
     * @param {number} max - Longitud máxima
     * @returns {boolean} True si cumple
     */
    longitudMaxima(valor, max) {
        return valor && valor.length <= max;
    },
    
    /**
     * Valida un formulario completo
     * @param {HTMLFormElement} formulario - Formulario a validar
     * @returns {boolean} True si todos los campos son válidos
     */
    validarFormulario(formulario) {
        let esValido = true;
        const campos = formulario.querySelectorAll('input, select, textarea');
        
        campos.forEach(campo => {
            const error = this.validarCampo(campo);
            if (error) {
                esValido = false;
                this.mostrarError(campo, error);
            } else {
                this.limpiarError(campo);
            }
        });
        
        return esValido;
    },
    
    /**
     * Valida un campo individual
     * @param {HTMLElement} campo - Campo a validar
     * @returns {string|null} Mensaje de error o null si es válido
     */
    validarCampo(campo) {
        const valor = campo.value;
        const tipo = campo.type;
        const requerido = campo.hasAttribute('required');
        
        if (requerido && !this.requerido(valor)) {
            return 'Este campo es obligatorio';
        }
        
        if (valor && tipo === 'email' && !this.email(valor)) {
            return 'Ingresa un correo electrónico válido';
        }
        
        if (valor && tipo === 'tel' && !this.telefono(valor)) {
            return 'Ingresa un teléfono válido de 10 dígitos';
        }
        
        if (valor && campo.minLength > 0 && !this.longitudMinima(valor, campo.minLength)) {
            return `Mínimo ${campo.minLength} caracteres`;
        }
        
        if (valor && campo.maxLength > 0 && !this.longitudMaxima(valor, campo.maxLength)) {
            return `Máximo ${campo.maxLength} caracteres`;
        }
        
        return null;
    },
    
    /**
     * Muestra un error en un campo
     * @param {HTMLElement} campo - Campo con error
     * @param {string} mensaje - Mensaje de error
     */
    mostrarError(campo, mensaje) {
        campo.classList.add('campo-error');
        
        let errorElement = campo.parentElement.querySelector('.mensaje-error');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'mensaje-error';
            campo.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = mensaje;
    },
    
    /**
     * Limpia el error de un campo
     * @param {HTMLElement} campo - Campo a limpiar
     */
    limpiarError(campo) {
        campo.classList.remove('campo-error');
        const errorElement = campo.parentElement.querySelector('.mensaje-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
};

const UI = {
    inicializar() {
        this.configurarNavegacion();
        this.configurarMenuMovil();
        this.configurarScrollTop();
        this.configurarTecladoAccesibilidad();
    },

    configurarNavegacion() {
        // Enlaces de navegación con scroll suave
        document.querySelectorAll('a[href^="#"]').forEach(enlace => {
            enlace.addEventListener('click', (e) => {
                const targetId = enlace.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    
                    this.cerrarMenuMovil();
                }
            });
        });

        window.addEventListener('scroll', this.debounce(() => {
            this.actualizarEnlaceActivo();
        }, 100));
    },
    
    configurarMenuMovil() {
        const btnMenu = document.getElementById('btn-menu-movil');
        const nav = document.getElementById('nav-principal');
        
        if (btnMenu && nav) {
            btnMenu.addEventListener('click', () => {
                nav.classList.toggle('nav-abierto');
                btnMenu.classList.toggle('activo');
                document.body.classList.toggle('menu-abierto');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#nav-principal') && !e.target.closest('#btn-menu-movil')) {
                this.cerrarMenuMovil();
            }
        });
    },
    
    cerrarMenuMovil() {
        const nav = document.getElementById('nav-principal');
        const btnMenu = document.getElementById('btn-menu-movil');
        
        if (nav) nav.classList.remove('nav-abierto');
        if (btnMenu) btnMenu.classList.remove('activo');
        document.body.classList.remove('menu-abierto');
    },
    
    configurarScrollTop() {
        const btnScrollTop = document.getElementById('btn-scroll-top');
        
        if (btnScrollTop) {
            window.addEventListener('scroll', () => {
                btnScrollTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
            });
            
            btnScrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },
    
    actualizarEnlaceActivo() {
        const secciones = document.querySelectorAll('section[id]');
        const enlaces = document.querySelectorAll('nav a[href^="#"]');
        
        let seccionActual = '';
        
        secciones.forEach(seccion => {
            const rect = seccion.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                seccionActual = seccion.id;
            }
        });
        
        enlaces.forEach(enlace => {
            enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${seccionActual}`);
        });
    },
    
    configurarTecladoAccesibilidad() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Catalogo.cerrarModalDetalle();
                Comparador.cerrarModal();
                Cotizaciones.cerrarModal();
                Contacto.cerrarModal();
                Contacto.cerrarModalPrueba();
                Autenticacion.cerrarModalLogin();
                Galeria.cerrarLightbox();
            }
        });
    },
    
    /**
     * Función debounce para optimizar eventos frecuentes
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    crearLoader() {
        if (!document.getElementById('loader')) {
            const loader = document.createElement('div');
            loader.id = 'loader';
            loader.className = 'loader-overlay';
            loader.innerHTML = `
                <div class="loader-spinner">
                    <div class="spinner"></div>
                    <p>Cargando...</p>
                </div>
            `;
            loader.style.display = 'none';
            document.body.appendChild(loader);
        }
    }
};

const BusquedaAvanzada = {
    inicializar() {
        const inputBusqueda = document.getElementById('busqueda-vehiculo');
        if (!inputBusqueda) return;
        
        let timeoutId;
        
        inputBusqueda.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                this.buscar(e.target.value);
            }, 300);
        });
        
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                Catalogo.aplicarFiltros();
            }
        });
    },
    
    /**
     * Realiza la búsqueda y muestra sugerencias
     * @param {string} termino - Término de búsqueda
     */
    buscar(termino) {
        if (termino.length < 2) {
            this.ocultarSugerencias();
            return;
        }
        
        const terminoLower = termino.toLowerCase();
        const sugerencias = AppState.vehiculos.filter(v => 
            `${v.marca} ${v.modelo} ${v.año} ${v.version}`.toLowerCase().includes(terminoLower)
        ).slice(0, 5);
        
        this.mostrarSugerencias(sugerencias);
    },
    
    /**
     * Muestra las sugerencias de búsqueda
     * @param {Array} sugerencias - Vehículos sugeridos
     */
    mostrarSugerencias(sugerencias) {
        let contenedor = document.getElementById('sugerencias-busqueda');
        
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'sugerencias-busqueda';
            contenedor.className = 'sugerencias-busqueda';
            document.getElementById('busqueda-vehiculo')?.parentElement.appendChild(contenedor);
        }
        
        if (sugerencias.length === 0) {
            contenedor.innerHTML = '<div class="sugerencia-item">No se encontraron resultados</div>';
        } else {
            contenedor.innerHTML = sugerencias.map(v => `
                <div class="sugerencia-item" onclick="BusquedaAvanzada.seleccionar(${v.id})">
                    <img src="${v.imagenes?.[0] || CONFIG.IMAGEN_DEFAULT}" alt="${v.marca}">
                    <div>
                        <strong>${v.marca} ${v.modelo}</strong>
                        <span>${v.año} - ${formatearMoneda(v.precio)}</span>
                    </div>
                </div>
            `).join('');
        }
        
        contenedor.style.display = 'block';
    },
    
    ocultarSugerencias() {
        const contenedor = document.getElementById('sugerencias-busqueda');
        if (contenedor) {
            contenedor.style.display = 'none';
        }
    },
    
    /**
     * Selecciona una sugerencia
     * @param {number} vehiculoId - ID del vehículo
     */
    seleccionar(vehiculoId) {
        this.ocultarSugerencias();
        Catalogo.verDetalle(vehiculoId);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚗 Iniciando Agencia de Carros...');
    
    try {
        UI.crearLoader();
        
        UI.inicializar();
        
        Autenticacion.verificarSesion();
        
        await Catalogo.cargarVehiculos();
        
        Comparador.cargarDesdeStorage();
        
        BusquedaAvanzada.inicializar();
        
        configurarEventListenersFiltros();
        
        console.log('✅ Aplicación iniciada correctamente');
        
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        mostrarNotificacion('Error al cargar la aplicación. Recarga la página.', 'error');
    }
});

const configurarEventListenersFiltros = () => {
    ['filtro-marca', 'filtro-tipo', 'filtro-año'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => Catalogo.aplicarFiltros());
    });
    
    ['filtro-precio-min', 'filtro-precio-max'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', UI.debounce(() => Catalogo.aplicarFiltros(), 500));
    });
    
    document.getElementById('ordenar-por')?.addEventListener('change', (e) => {
        Catalogo.ordenarPor(e.target.value);
    });
    
    document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => Catalogo.limpiarFiltros());
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.campo-busqueda')) {
            BusquedaAvanzada.ocultarSugerencias();
        }
    });
};

window.Catalogo = Catalogo;
window.Comparador = Comparador;
window.Cotizaciones = Cotizaciones;
window.Contacto = Contacto;
window.Autenticacion = Autenticacion;
window.Galeria = Galeria;
window.BusquedaAvanzada = BusquedaAvanzada;
window.mostrarNotificacion = mostrarNotificacion;