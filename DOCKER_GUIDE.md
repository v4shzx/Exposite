# Guía de Docker - Exposite

Este archivo contiene los comandos necesarios para ejecutar el proyecto en entornos de desarrollo y producción utilizando Docker.

## 🚀 Entorno de Desarrollo (Dev)

```bash
# Iniciar en modo interactivo (ver logs)
docker compose up dev

# Iniciar en segundo plano (detached)
docker compose up -d dev
```

## 🏗️ Entorno de Producción (Prod)

```bash
# Iniciar en modo interactivo
docker compose up prod

# Iniciar en segundo plano (detached)
docker compose up -d prod

# limpiar todo antes de reconstruir (asegura una instalación limpia):
docker compose down
docker compose up --build prod

# Tauri
npm run dev: Sigue funcionando igual (Web en navegador).
npm run dev:desktop: Lanza la versión de escritorio de Tauri (con Hot Reload).
npm run build: Genera la versión para producción web (Docker/Nginx).
npm run build:desktop: Genera el ejecutable (.app o .exe) final.


```
