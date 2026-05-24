# Flask Text-to-SQL Backend

## Folder structure

```
backend_text_to_sql/
  app.py
  requirements.txt
  .env.example
  src/
    config/
      db.py
    controllers/
      chat_controller.py
    routes/
      chat_route.py
    services/
      chat_service.py
      database_service.py
      gemini_service.py
```

## Setup (Conda)

```bash
conda create -n venv python=3.11.0
conda activate venv
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Configure environment

Copy `.env.example` to `.env` and fill values:

```
GOOGLEAPI=your_gemini_key
DB_HOST=your_host
DB_PORT=5432
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_SSLMODE=prefer
SCHEMA_PATH=schema.prisma
PORT=5000
```

## Run

```bash
python app.py
```

## API

- POST `/api/chat/ask`
  - Body: `{ "message": "your question" }`
  - Response: `{ "answer": "...", "sql": "...", "data": [...] }`
