# AHUB Backend

Backend for Andhra University Hub (AHUB).

## Tech Stack

* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic
* JWT Authentication

## Project Structure

```text
AHUB/
├── app/
├── alembic/
├── tests/
├── main.py
└── requirements.txt
```

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the development server:

```bash
uvicorn main:app --reload
```