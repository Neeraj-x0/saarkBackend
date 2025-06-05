# Task Management API

A basic backend for managing tasks in a team. Managers can assign tasks to employees, who can then update the status. Includes real-time notifications using Socket.IO and secure auth with JWT.

## Tech Stack

- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Socket.IO for real-time updates
- Zod for input validation
- Morgan, bcrypt, CORS, dotenv

## Getting Started

### Requirements

- Node.js
- MongoDB
- npm or pnpm

### Setup

1. Clone the repo

   ```bash
   git clone https://github.com/Neeraj-x0/saarkBackend
   cd saarkBackend
   ```

2. Install dependencies

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Add `.env` file:

   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db>
   JWT_SECRET=your_secret
   ```

4. Start server

   ```bash
   pnpm start
   # or
   npm start
   ```

## API Endpoints

### Auth

- `POST /auth/register` – create account
- `POST /auth/login` – get token
- `GET /auth/profile` – get current user (via token)
- `PUT /auth/profile/:userId` – update profile
- `DELETE /auth/profile/:userId` – delete user
- `GET /auth/employees` – list all employees (manager only)

### Tasks

- `POST /tasks` – create task (manager)
- `GET /tasks` – get tasks (based on role)
- `GET /tasks/:id` – get single task
- `PUT /tasks/:id` – update task (manager)
- `DELETE /tasks/:id` – delete task (manager)
- `PATCH /tasks/:id/status` – update task status (employee)
- `GET /tasks/user/:userId` – get tasks assigned to a user

## Socket.IO Events

| Event            | When it Fires          | Data Sent                 |
| ---------------- | ---------------------- | ------------------------- |
| `join`           | After login            | userId                    |
| `task:assigned`  | Manager assigns a task | taskId, title, assignedBy |
| `task:updated`   | Task is edited         | taskId, title, updates    |
| `task:completed` | Marked as completed    | taskId, title             |

## Socket Testing

Use browser tools like Socket.IO Client or run a custom script:

- Connect to `http://localhost:3000`
- Emit `join` with your user ID
- Listen for task events

## Frontend & Demo

**Frontend Repository:**
[https://github.com/Neeraj-x0/saarkassessment](https://github.com/Neeraj-x0/saarkassessment)

**Live Frontend App:**
[https://saarkassessment.vercel.app/](https://saarkassessment.vercel.app/)




## Backend Repository:
[https://github.com/Neeraj-x0/saarkBackend](https://github.com/Neeraj-x0/saarkBackend)

**Hosted API:**
[https://taskback-d1788b8581c9.herokuapp.com/](https://taskback-d1788b8581c9.herokuapp.com/)

## Postman Collection

**Public Workspace:**
[Postman Collection](https://www.postman.com/neerajx0/workspace/public-workspace/collection/32611957-8cbeeb2d-e843-4c75-995a-1c4d4b810748?action=share&creator=32611957)

Includes sample requests for all key endpoints. Use the `Tests` tab for token automation as described above.

---

