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
│   └── tasks/
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── admin.py
│       └── tests.py│   
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
```

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Vite
- Database: PostgreSQL
- Containerization: Docker and Docker Compose

---

## Requirements

To run this project locally, you only need:

- Docker
- Docker Compose

---

## How to Run the Project Locally

1. Clone the repository
```
git clone https://github.com/pichiloor/todo-app.git 
cd todo-app
```
2. Start the application
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

- Frontend application:  
  http://localhost:5173

- Backend API:  
  http://localhost:8000

- Django Admin panel:  
  http://localhost:8000/admin

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

## Running Backend Tests

Backend tests are written using Django and Django REST Framework.

To run the tests:

docker compose exec backend python manage.py test

The tests cover:
- creating tasks
- listing tasks
- updating tasks
- deleting tasks
- handling error cases (invalid data and non-existing tasks)

---


## Author

Andres Loor
