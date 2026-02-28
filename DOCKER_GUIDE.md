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


