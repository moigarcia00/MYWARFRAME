# MyWarframe API

Backend FastAPI de MyWarframe. De momento es un esqueleto: sirve para comprobar
que el servidor arranca, que CORS está configurado y que la documentación
automática funciona.

## Requisitos

- Python 3.10 o superior
- pip

## Puesta en marcha en Windows (PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Puesta en marcha en Git Bash

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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
