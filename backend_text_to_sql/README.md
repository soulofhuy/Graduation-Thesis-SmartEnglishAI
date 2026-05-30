# Flask Text-to-SQL Backend

## Folder structure

```
backend_text_to_sql/
  app.py
  requirements.txt
  .env.example
  src/
    config/
      database.py
    controllers/
      chat_controller.py
    routes/
      chat_routes.py
    services/
      analysis_service.py
      chat_service.py
      database_service.py
      gemini_service.py
      schema_service.py
    prompts/
      analysis_prompt.py
      sql_prompt.py
    utils/
      sql_validator.py
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
DATABASE_URL=postgresql://username:password@host:5432/postgres
GOOGLE_API_KEY=your_gemini_key
SCHEMA_PATH=../backend/prisma/schema.prisma
PORT=5000
```

## Run

```bash
python app.py
```

## API

- POST `/api/chat`
  - Body: `{ "message": "your question" }`
  - Response: `{ "success": true, "question": "...", "sql": "...", "columns": [...], "rows": [...], "analysis": "..." }`
