# Guía de Docker - Exposite

Este archivo contiene los comandos necesarios para ejecutar el proyecto en entornos de desarrollo y producción utilizando Docker.

## 🚀 Entorno de Desarrollo (Dev)
Usa `Dockerfile.dev`, tiene **hot reload** habilitado mediante volúmenes y corre en el puerto **5173**.

```bash
# Iniciar en modo interactivo (ver logs)
docker compose up dev

# Iniciar en segundo plano (detached)
docker compose up -d dev
```

## 🏗️ Entorno de Producción (Prod)
Construye la aplicación (build) y la sirve usando Nginx en el puerto **8080**.

```bash
# Iniciar en modo interactivo
docker compose up prod

# Iniciar en segundo plano (detached)
docker compose up -d prod
```

## 🛠️ Comandos Generales

| Acción | Comando |
| :--- | :--- |
| **Detener contenedores** | `docker compose stop` |
| **Bajar/Eliminar contenedores** | `docker compose down` |
| **Reconstruir imágenes** | `docker compose build` |
| **Ver logs** | `docker compose logs -f` |

---
**Nota:** Ejecuta estos comandos desde la raíz del proyecto.
