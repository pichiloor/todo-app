# Part 2: Analysis Document

## The approach I decided to use

For this exercise I chose to make a simple but complete full-stack Todo app.  
The main goal was to clearly show how the backend, frontend and database work together, and also use good practices.

### Backend  
I picked **Django + Django REST Framework** because it helps to create APIs quickly and in a very organized way. It also has very good tools for authentication, validation and testing.  

For the database I used **PostgreSQL** because it is strong and very common in real projects.

### Frontend  
I used **React + Vite** because it is fast to start and it is one of the most popular combinations right now.  

I wanted to keep the frontend simple. I just focused on connecting to the API and doing the normal CRUD operations.

### Authentication  
I decided to use **JWT** (JSON Web Tokens) to protect the API.  

I didn’t make a login screen in the frontend because the main goal was to show how the API protection works, not to make a perfect login system.  

The frontend gets the token automatically using some test credentials that I put in the environment variables. This makes everything faster for this exercise.

### Docker  
The whole project runs with **Docker Compose**.  

You only need one command to start everything.  
No manual installation, no complicated setup.  
This makes it very easy to run on any computer.

## Tests
I wrote **automatic tests** in the backend using Django's testing tools.

The tests cover:

- Trying to use the API **without** a token → should return 401
- Creating tasks with and without due date
- Creating a task with only the required fields
- Creating a task without any data → should return 400
- Listing tasks
- Updating a task (title, completed status, due date)
- Deleting a task
- Trying to update or delete a task that doesn't exist → should return 404

In the tests I create a test user and a JWT token directly.
This is a very common approach because it's faster and doesn't depend on the login flow.

## Other ways I could have done it

There are other good options too, for example:

- Use **FastAPI** instead of Django REST Framework (faster + better types, but needs a bit more initial work)
- Make a real login screen in React with forms and everything
- Use cookies instead of JWT.
- Have different Docker configurations for development and production

## Conclusion

I tried to find a good balance between **simple** and **realistic**.  

The application is not super complete, but it shows very clearly:

- how to structure a full-stack project
- how to protect an API with authentication
- how to write automatic tests
- how to run everything easily with Docker

This way the project is  
→ easy to understand  
→ easy to run  
→ easy to add more things later if needed

I also make a README.md document so you can understand how to run the project correctly and also the repository is on Github (public) if you want to clone the repository.