# TimeCapsuleX

TimeCapsuleX is a secure full-stack web app for creating encrypted "time capsules" that unlock in the future. Users can write private messages, lock them until a chosen date and time, and optionally protect capsules with passwords or self-destruct behavior after viewing.

## Project Description

This project combines a React frontend and a Node.js/Express backend to deliver a modern time-locked sharing experience.

- Secure authentication with JWT access and refresh tokens
- Encrypted capsule payloads using AES-256-CBC
- Unlock scheduling and cleanup jobs powered by BullMQ + Redis
- REST API with validation, rate limiting, and centralized error handling
- Responsive UI built with React, Vite, Tailwind CSS, and Framer Motion

## Tech Stack

- Frontend: React, React Router, Axios, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB (Mongoose), Redis, BullMQ
- Security: bcrypt, JWT, AES encryption, Helmet, CORS, rate limiting
- Tooling: Nodemon, Jest, Supertest

## Repository Structure

```
TimeCapsuleX/
|- client/   # React frontend
|- server/   # Express API + jobs
|- README.md
```

## Features

- User registration and login
- Create time-locked capsules
- Unlock capsules only after release time
- Optional password protection for capsules
- Optional self-destruct after opening
- Email and background-job workflow hooks
- Dashboard and capsule viewing experience

## Environment Variables

Create two environment files:

- `server/.env`
- `client/.env` (if needed for frontend runtime variables)

Server variables expected in `server/.env` include:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `AES_SECRET_KEY`
- `CLIENT_URL`
- Email and Cloudinary credentials (if those features are enabled)

An example template is available in `.env.example`.

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
```

Backend default: `http://localhost:5000`

### 3. Start the frontend

```bash
cd client
npm run dev
```

Frontend default: `http://localhost:5173`

## API Overview

Base URL: `http://localhost:5000/api/v1`

- Auth routes: `/auth`
- Capsule routes: `/capsules`
- Health check: `/health`

## Testing

Run backend tests:

```bash
cd server
npm test
```

## Notes

- Redis is required for scheduled background jobs. If `REDIS_URL` is missing, the API can still run but job features are disabled.
- Use the master prompt file `TimeCapsuleX_Master_Prompt.md` for phased development guidance.
