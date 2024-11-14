# Clínica Online - README

## Descripción del Proyecto

**Clínica Online** es una aplicación web que permite la gestión de turnos médicos y la administración de usuarios para una clínica. Los usuarios pueden ser pacientes, especialistas o administradores, con distintos niveles de acceso a la plataforma.

Este proyecto está dividido en tres entregas (Sprint 1, Sprint 2 y Sprint 3), y cada sprint agrega nuevas funcionalidades y mejoras a la aplicación. Este archivo README describe las funcionalidades, las pantallas principales, las formas de acceso y cómo cada sección está organizada.

## Requerimientos

- **Favicon**: Se agrega un ícono personalizado para la aplicación.
- **Subido a la web**: La aplicación debe estar desplegada y accesible online.
- **Loading**: Animación de carga en las pantallas de carga.

### Registro y Gestión de Usuarios

#### 1. Página de bienvenida
- Accesos rápidos al **login** y **registro** del sistema.

#### 2. Registro
- **Pacientes**:
  - Nombre
  - Apellido
  - Edad
  - DNI
  - Obra Social
  - Email
  - Contraseña
  - 2 imágenes de perfil

- **Especialistas**:
  - Nombre
  - Apellido
  - Edad
  - DNI
  - Especialidad (con posibilidad de agregar especialidad si no está en la lista)
  - Email
  - Contraseña
  - Imagen de perfil

  **Validación de campos**: Los campos deben ser validados correctamente.

#### 3. Login
- Acceso al sistema según el tipo de usuario:
  - **Especialistas**: Solo pueden ingresar si su cuenta ha sido aprobada por un administrador.
  - **Pacientes**: Solo pueden ingresar si su email ha sido verificado.

#### 4. Sección de Usuarios (Accesible solo para Administradores)
- Los administradores pueden ver la información de todos los usuarios, habilitar o inhabilitar cuentas de especialistas, y generar nuevos usuarios.

### Gestión de Turnos

#### 1. Mis Turnos (Accesible para Pacientes)
- Los pacientes pueden ver los turnos solicitados.
- Filtros disponibles por especialidad o especialista (sin usar Combobox).
- Acciones disponibles para los pacientes:
  - **Cancelar turno** (solo si no se ha realizado)
  - **Ver reseña** (si hay comentarios disponibles)
  - **Completar encuesta** (si el especialista ha marcado el turno como realizado)
  - **Calificar Atención** (si el turno fue realizado).

#### 2. Mis Turnos (Accesible para Especialistas)
- Los especialistas pueden ver los turnos asignados.
- Filtros disponibles por especialidad o paciente (sin usar Combobox).
- Acciones disponibles para los especialistas:
  - **Cancelar turno**
  - **Rechazar turno**
  - **Aceptar turno**
  - **Finalizar turno** (requiere dejar una reseña sobre la consulta).

#### 3. Turnos (Accesible solo para Administradores)
- Los administradores pueden ver todos los turnos de la clínica.
- Filtros disponibles por especialidad o especialista (sin usar Combobox).
- **Cancelar turno**: Solo visible si el turno no ha sido Aceptado, Realizado o Rechazado.

#### 4. Solicitar Turno
- Pacientes y administradores pueden solicitar turnos.
  - Selección de especialidad, especialista, y fecha del turno (dentro de los próximos 15 días).
  - **Administrador**: Puede asignar el turno a un paciente.

#### 5. Mi Perfil
- Los usuarios pueden ver y editar su perfil (nombre, apellido, imágenes, etc.).
- **Mis Horarios**: Solo visible para los especialistas, donde pueden marcar su disponibilidad horaria.
  
#### 6. CAPTCHA en Registro
- Implementación de CAPTCHA de Google en la sección de registro para evitar registros automatizados.

### Funcionalidades Avanzadas y Mejoras

#### 1. Historia Clínica
- La historia clínica será visible desde:
  - **Mi Perfil** (para pacientes)
  - **Sección Usuarios** (para administradores)
  - **Sección Pacientes** (para especialistas que hayan atendido al paciente).
  
  **Datos de la historia clínica**:
  - Datos fijos: Altura, Peso, Temperatura, Presión.
  - Datos dinámicos: Hasta 3 claves y valores (por ejemplo: "Caries: 4").

#### 2. Mejora en Filtros de Turnos
- Filtros mejorados para buscar por cualquier campo de turno, incluyendo datos de la historia clínica (fijos y dinámicos).

#### 3. Exportar Datos
- **Administrador**: Posibilidad de descargar un **Excel** con los datos de los usuarios.
- **Pacientes**: Posibilidad de descargar un **PDF** con la historia clínica, incluyendo el logo de la clínica, el título del informe y la fecha de emisión.

---

## Instalación

Para ejecutar la aplicación de manera local, sigue estos pasos:

### 1. Clona el repositorio

```bash
git clone https://github.com/usuario/clinca-online.git
cd clinica-online
