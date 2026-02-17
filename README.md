# Todo App

This project is a simple full stack Todo application.
It demonstrates basic CRUD operations, backend and frontend integration, Docker usage,
and automated backend tests.

The application allows users to create, update, delete, and complete tasks.

---

## Project Structure

```
todo-app/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── tasks/
│       ├── __init__.py
│       ├── admin.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── tests.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── example.env
    ├── .env
    ├── .gitignore
    ├── node_modules/
    └── src/
        ├── assets/
        ├── services/
        │   ├── api.js
        │   └── auth.js
        ├── App.jsx
        ├── App.css
        ├── main.jsx
        └── index.css
```

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite
- Database: PostgreSQL
- Containerization: Docker

---

## Requirements

To run this project locally, you only need:

- Docker
- Git

You can download Docker from:
https://www.docker.com/products/docker-desktop/

You can download Git from:
https://git-scm.com/downloads

---

## How to Run the Project Locally

You can run the project either by cloning the repository or by using the provided ZIP file.

1. Get the project ready.

### Option A: Clone the repository

```
git clone https://github.com/pichiloor/todo-app.git 
cd todo-app
```

### Option B: Use the ZIP file

Extract the file `FullStack-Test_AndresLoor.zip` and open a terminal inside the extracted
project root folder.


2. Set up the environment file

Before starting the application, create a `.env` file inside the `frontend` folder
by copying `example.env`:

```
cp frontend/example.env frontend/.env
```

Then open `frontend/.env` and fill in your values:

```
VITE_API_URL=http://localhost:8000
VITE_API_USER=your_username
VITE_API_PASSWORD=your_password
```

- `VITE_API_URL` — the backend URL (leave as-is for local development)
- `VITE_API_USER` — the Django user the frontend will use to authenticate
- `VITE_API_PASSWORD` — the password for that user

To create a Django user, start the containers first and then run:

```
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to set a username and password, then put those same credentials
in your `.env` file.

3. Start the application

```
docker compose up
```

Docker will automatically start:
- the PostgreSQL database
- the Django backend API
- the React frontend application

No manual commands are required.

---

## Access the Application

Once the containers are running, you can access:

- Frontend application: http://localhost:5173

- Backend API: http://localhost:8000

- Django Admin panel: http://localhost:8000/admin

---

## Django Admin Access

To use the Django admin panel, you must create a superuser.

Open a new terminal and run:

```
docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to create a username and password.
Then log in at:

http://localhost:8000/admin

---

## Loading Sample Data

To load sample tasks into the database, run:

```
docker compose exec backend python manage.py loaddata sample_tasks
```

This will insert 5 example tasks with different statuses and due dates.

---

## Running Backend Tests

Backend tests are written using Django and Django REST Framework.

To run the tests:

```
docker compose exec backend python manage.py test
```

The tests cover:
- creating tasks
- listing tasks
- updating tasks
- deleting tasks
- handling error cases (invalid data and non-existing tasks)

---

## API Authentication and Testing (JWT)

All backend API endpoints are protected using JWT authentication
(`djangorestframework-simplejwt`).

Because of this, API endpoints cannot be accessed directly from the browser
without authentication and will return `401 Unauthorized`.

To test the API manually, you must first obtain a JWT token and then include it
in the request headers.

The recommended way to test the API is by using Postman.

To obtain a JWT token, create a POST request in Postman with the following
configuration:

URL:
http://localhost:8000/api/auth/token/

Method:
POST

Body:
Select `raw` and `JSON` as the body type and send the following payload:

{
  "username": "<your_username>",
  "password": "<your_password>"
}

You can use a Django superuser or any existing user.

If the credentials are valid, the API will respond with a JSON object containing
a refresh token and an access token. Copy the value of the `access` token, as it
will be required to authenticate all subsequent API requests.

For every protected API request, the access token must be sent in the
Authorization header using the Bearer scheme:

Authorization: Bearer Token <ACCESS_TOKEN>

In Postman, this can be done by opening a new request, going to the
Authorization tab, selecting `Bearer Token` as the type, and pasting the access
token in the Token field.

Once authenticated, the following API endpoints can be tested:

List tasks:
GET http://localhost:8000/api/tasks/

Create a task:
POST http://localhost:8000/api/tasks/

Example request body:
{
  "title": "Task created from Postman",
  "description": "Testing JWT authentication",
  "completed": false
}

Update a task:
PATCH http://localhost:8000/api/tasks/<task_id>/

Example request body:
{
  "completed": true
}

Delete a task:
DELETE http://localhost:8000/api/tasks/<task_id>/

Alternatively, the API can be tested using the command line with curl.

To obtain a token using curl:
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"<username>","password":"<password>"}'

To access a protected endpoint using curl:
curl http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

All API endpoints require JWT authentication, tokens must always be sent in the
Authorization header, and tokens are never sent in the request body. This
authentication flow is intentional and demonstrates proper backend API security.


## Author

Andres Loor
