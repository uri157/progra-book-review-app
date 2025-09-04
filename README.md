# Reseñas de Libros

Aplicación de reseñas de libros construida con [Next.js](https://nextjs.org).

[![Build on PR](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-build.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-build.yml)
[![Tests on PR](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-test.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-test.yml)
[![Docker to GHCR](https://github.com/uri157/progra-book-review-app/actions/workflows/release-docker.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/release-docker.yml)

---

## 🌐 Producción

**URL pública:** [https://progra4-deploy-vercel.vercel.app](https://progra4-deploy-vercel.vercel.app)

---

## 🚀 Deploy local (cómo correr en tu máquina)

**Requisitos:** Node 20+, npm 9/10+.

```bash
npm ci
npm run dev
# abrir http://localhost:3000
```

Build de producción:

```bash
npm ci
npm run build
npm start
# http://localhost:3000
```

---

## 🔧 Variables de entorno necesarias

La app no requiere secretos para funcionar. El puerto es opcional:

| Variable | Descripción                                 | Por defecto |
| -------: | ------------------------------------------- | ----------- |
|   `PORT` | Puerto de la app (`npm start` o con Docker) | `3000`      |

> Si en el futuro agregás claves/URLs, colocalas en `.env.local` (local), en **Vercel → Project → Environment Variables** (producción) y como **Secrets** en GitHub (para Actions).

---

## 🐳 Ejecutar con Docker (cómo correr con contenedor)

Build & run:

```bash
docker build -t resenas-libros .
docker run --rm -p 3000:3000 resenas-libros
# http://localhost:3000
```

Con variables (si las hubiera) desde archivo:

```bash
docker run --rm -p 3000:3000 --env-file .env.local resenas-libros
```

---

## ⚙️ CI/CD (GitHub Actions)

Los workflows viven en `.github/workflows/` y automatizan build, tests y publicación de imagen Docker en GHCR.

### 1) Build en Pull Requests — `pr-build.yml`

* **Disparador:** `on: pull_request`
* **Qué hace:** instala dependencias (`npm ci`) y ejecuta `npm run build`.
* **Resultado:** si falla el build, el **PR falla**. Sube `build.log` como artifact.
* **Cache:** usa caché de npm para acelerar corridas subsecuentes.

### 2) Tests en Pull Requests — `pr-test.yml`

* **Disparador:** `on: pull_request`
* **Qué hace:** instala dependencias y corre `npm test`.
* **Resultado:** si algún test falla, el **PR falla**. Sube `test.log` como artifact.
* **Notas:** si no existen tests, el job puede mostrarse como “skipped”. Se recomienda agregar al menos un test básico.

### 3) Docker a GHCR en `main` — `release-docker.yml`

* **Disparador:** `on: push` a `main`.
* **Qué hace:** construye una imagen con el `Dockerfile` y la publica en **GitHub Container Registry (GHCR)**.
* **Tags publicados:**

  * `latest` (último build de `main`)
  * `<version>` (tomado de `package.json`, ej. `0.1.0`)
  * `sha-<commit>` (inmutable, ideal para auditoría/rollback)
* **Permisos requeridos:** repo → *Settings → Actions → General* → **Workflow permissions: Read and write**.

> **Ver la imagen publicada:** Repo → panel derecho **Packages** → nombre del paquete (imagen).
> **Hacerla pública (opcional):** *Packages → Package settings → Change visibility → Public*.

---

## ✅ Demostración de que los GitHub Actions funcionan

### A) Checks en Pull Request

1. Crear PR contra `main` con cualquier cambio (este README, por ejemplo).
2. En el PR, pestaña **Checks**, deben correr y pasar:

   * **CI - Build on PR**
   * **CI - Tests on PR**
3. Abrir cada job para ver logs y artifacts (`build.log`, `test.log`).

**Badges (estado en tiempo real):**
[![Build on PR](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-build.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-build.yml)
[![Tests on PR](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-test.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/pr-test.yml)


### B) Publicación de imagen en GHCR (al mergear a `main`)

1. Hacer **merge** del PR a `main`.
2. Repo → **Actions** → workflow **Release - Docker to GHCR** en **success**.
3. Repo → **Packages** → verificar tags publicados:

   * `ghcr.io/uri157/progra-book-review-app:latest`
   * `ghcr.io/uri157/progra-book-review-app:<version>`
   * `ghcr.io/uri157/progra-book-review-app:sha-<commit>`

**Badge:**
[![Docker to GHCR](https://github.com/uri157/progra-book-review-app/actions/workflows/release-docker.yml/badge.svg)](https://github.com/uri157/progra-book-review-app/actions/workflows/release-docker.yml)

### C) (Opcional) Probar el pull de la imagen

Si el paquete es público:

```bash
docker pull ghcr.io/uri157/progra-book-review-app:latest
docker run --rm -p 3000:3000 ghcr.io/uri157/progra-book-review-app:latest
# http://localhost:3000
```

Si es privado, loguearse primero:

```bash
echo <PAT_CON_read:packages> | docker login ghcr.io -u uri157 --password-stdin
docker pull ghcr.io/uri157/progra-book-review-app:latest
```

---

## 🧰 Troubleshooting rápido

* **No corren los workflows:** confirmá que los YAML están en `.github/workflows/` y que **Actions** estén habilitadas en *Settings → Actions*.
* **Push a GHCR falla:** habilitá **Read and write permissions** en *Settings → Actions → Workflow permissions*.
* **No veo la imagen:** revisá **Actions → Release - Docker to GHCR** y el panel **Packages** del repo.
* **Docker local sin permisos:** agregá tu usuario al grupo `docker` o usá `sudo`.
