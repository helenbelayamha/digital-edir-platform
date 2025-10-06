# Digital Edir Platform

A community platform for managing Ethiopian Edir groups, contributions, and events.

## Features

- ✅ User Authentication (Register/Login)
- ✅ Private Group Management
- ✅ Join Request System with Admin Approval
- ✅ Contribution Tracking
- ✅ Event Scheduling

## Tech Stack

**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB
**Authentication:** JWT

## Setup

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Start backend: `npm run dev`
4. Open frontend: Open `frontend/login.html` in browser

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/groups` - Create private group
- `POST /api/groups/:id/join` - Request to join group
- `GET /api/requests/pending` - Get pending join requests
