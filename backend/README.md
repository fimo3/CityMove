# CityMove backend

This is a minimal Django backend providing an API proxy to GraphHopper for routing.

Requirements

- Python 3.10+
- Install dependencies:

```bash
python -m venv .venv; .venv\Scripts\activate; pip install -r requirements.txt
```

Environment

- GRAPHOPPER_KEY: your GraphHopper API key (server-side)

Run

```bash
export GRAPHOPPER_KEY=your_key  # or set in Windows powershell
python manage.py migrate
python manage.py runserver 8000
```

The routing endpoint will be available at http://localhost:8000/api/route/ and accepts POST JSON:

{"start": {"lat":..., "lng":...}, "dest": {"lat":..., "lng":...}}

It returns:

{"coords": [[lat,lng], ...]}
