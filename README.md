# Exposite 🚀

**Exposite** es una herramienta moderna y multiplataforma diseñada para docentes y evaluadores. Permite gestionar grupos, miembros y rúbricas de evaluación de manera sencilla, facilitando el proceso de seguimiento de puntajes durante presentaciones o exposiciones.

Mantén el control total de tus evaluaciones con una interfaz intuitiva, soporte para modo oscuro y exportación de resultados.

---

## ✨ Características Principales

- 👥 **Gestión de Grupos**: Crea y organiza múltiples grupos de estudiantes o equipos.
- 📋 **Control de Miembros**: Listado detallado con números de lista y avatares automáticos.
- 📑 **Rúbricas Personalizables**: Define tus propios criterios de evaluación y puntajes máximos.
- ⏱️ **Modo Presentación**: Flujo optimizado para evaluar en tiempo real, con selección aleatoria de alumnos.
- 🌓 **Modo Oscuro/Claro**: Interfaz adaptable con estética premium.
- 📄 **Exportación a PDF**: Genera reportes profesionales de los resultados con un solo clic.
- 📥 **PWA & Desktop**: Úsala en la web o descárgala como aplicación nativa de escritorio.

---

## 💻 Multiplataforma

Exposite está diseñada para funcionar donde sea que la necesites:

- **Web**: Acceso instantáneo desde cualquier navegador.
- **Escritorio**: Aplicación nativa para **Windows, macOS y Linux** (desarrollada con Tauri).
- **Docker**: Despliegue sencillo y reproducible mediante contenedores.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Escritorio**: [Tauri](https://tauri.app/) (Rust 🦀)
- **Despliegue**: Docker & Nginx

---

## 🚀 Inicio Rápido (Desarrollo)

### Requisitos Previos

- Node.js (v20+)
- Rust (solo si deseas la versión de escritorio)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/Exposite.git
   cd Exposite
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Comandos de Ejecución

- **Web (Modo Dev)**: `npm run dev`
- **Escritorio (Modo Dev)**: `npm run dev:desktop`
- **Web (Build)**: `npm run build`
- **Escritorio (Build)**: `npm run build:desktop`

---

## 🐳 Docker

Para levantar la aplicación usando Docker:

**Modo Desarrollo (con Hot Reload):**

```bash
docker compose up dev
```

**Modo Producción (Servido con Nginx):**

```bash
docker compose up prod
```

_Accede en: `http://localhost:8080`_

---

## 🛠️ Automatización con GitHub Actions

Este repositorio incluye un flujo de trabajo que genera automáticamente los instaladores para Windows, macOS y Linux en cada "Release". Solo tienes que subir tu código y GitHub se encarga del resto.

---

## 📄 Notas sobre Persistencia

Actualmente, los datos se almacenan de forma segura en el `localStorage` del navegador o Webview. Esto garantiza que tus datos sean privados y no requieren de una base de datos externa para funcionar.

---

Desarrollado con ❤️ para mejorar la experiencia educativa.
