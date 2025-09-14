# Reseñas de Libros

Aplicación de reseñas de libros construida con [Next.js](https://nextjs.org).

Ahora incluye autenticación con JWT y persistencia de reseñas en una base de datos **MongoDB**.

## URL pública

https://progra4-deploy-vercel.vercel.app

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto utilizado por el servidor (Docker o `npm start`) | `3000` |

| `MONGODB_URI` | Cadena de conexión a MongoDB | - |
| `JWT_SECRET` | Secreto utilizado para firmar tokens JWT | - |
| `GOOGLE_BOOKS_API_KEY` | Clave de API de Google Books | - |

## Ejecutar localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir [http://localhost:3000](http://localhost:3000)

Para ejecutar las pruebas:
```bash
npm test
```

## Ejecutar con Docker

```bash
docker build --build-arg MONGODB_URI=<your_mongodb_uri> -
docker run -p 3000:3000 resenas-libros
```

La aplicación quedará disponible en `http://localhost:3000`.

## Workflows de GitHub Actions

- **Test** (`.github/workflows/test.yml`): ejecuta `npm test` en cada pull request.
- **Build** (`.github/workflows/build.yml`): instala dependencias, ejecuta pruebas y compila la aplicación en las pull requests.
- **Docker** (`.github/workflows/docker.yml`): al hacer push a `main` construye y publica una imagen en GitHub Container Registry.

