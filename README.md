# Fitness Class Booking System

Fitness Class Booking System is a MERN application for browsing fitness classes, booking classes, managing bookings, and administering class records.

## Public URL

Public project URL: `TODO: add deployed URL`

## Test Login

Admin dashboard access:

- Email: `admin@admin.com`
- Password: `admin`

## Project Setup

Install dependencies from the project root:

```bash
npm run install-all
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your MongoDB connection string:

```bash
MONGO_URI=<YOUR MONGODB CONNECTION STRING>
JWT_SECRET=<YOUR JWT SECRET>
PORT=5001
```

Seed the starter fitness classes:

```bash
cd backend
npm run seed:classes
```

Run the app from the project root:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.
The backend runs on `http://localhost:5001`.

## Tests

Run backend tests:

```bash
cd backend
npm test
```

Run frontend tests:

```bash
cd frontend
npm test -- --watchAll=false
```

## Core Features

- User registration, login, JWT authentication, and logout.
- Member class browsing and booking.
- Member booking viewing and cancellation.
- Admin class create, edit, and delete.
- Admin/member role-based navigation.
- Profile viewing and updating, including account type.
