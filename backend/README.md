# MyWarframe API

Backend FastAPI de MyWarframe. De momento es un esqueleto: sirve para comprobar
que el servidor arranca, que CORS está configurado y que la documentación
automática funciona.

## Requisitos

- Python 3.10 o superior (probado con 3.14.7)
- pip
- PostgreSQL 18 en local (opcional para `/health`, necesario para guardar datos)

## Puesta en marcha en Windows (PowerShell)

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Puesta en marcha en Git Bash

```bash
cd backend
py -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Si `venv` ya existe, puedes saltarte la creación e instalación y arrancar
directamente con `uvicorn app.main:app --reload`.

Con el servidor arrancado:

- API: <http://127.0.0.1:8000>
- Documentación interactiva: <http://127.0.0.1:8000/docs>
- Comprobación de salud: <http://127.0.0.1:8000/health>

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores si hace falta:

```bash
cp .env.example .env
```

`CORS_ORIGINS` es una lista separada por comas con las URLs que pueden llamar
al backend (el frontend local y el de Vercel).

`DATABASE_URL` es la conexión a PostgreSQL. En local, con el usuario `postgres`
y la base `mywarframes`:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:TU_CONTRASENA@localhost:5432/mywarframes
```

Sustituye `TU_CONTRASENA` por tu contraseña. El archivo `.env` no se sube a
GitHub.

## Estructura

```
backend/
  app/
    main.py          # arranque de FastAPI y CORS
    api/routes/      # endpoints
    core/            # configuración y utilidades
    services/        # WFCD, warframe.market, normalización
    schemas/         # modelos de respuesta
  requirements.txt
  .env.example
```

## Siguientes pasos

- Endpoints de skins y helmets.
- Servicio para llamar a WFCD y cachear datos.
- Servicio para warframe.market con la cabecera `Language: es`.
