# Car Platform - Admin Dashboard

Modern car listing platform with comprehensive admin dashboard built with React, TypeScript, Express.js, and PostgreSQL.

## Project Structure

```
.
├── server/              # Backend API (Express.js + PostgreSQL)
│   ├── routes/          # API route handlers
│   ├── db.js            # Database connection
│   ├── index.js         # Server entry point
│   └── package.json
├── database/            # Database migrations
│   └── migrations/
│       └── complete_system_schema.sql
├── src/                 # Frontend application (React + TypeScript)
│   ├── components/      # React components
│   ├── lib/            # API client and utilities
│   └── main.tsx        # Frontend entry point
└── README.md
```

## Features

### Core Modules
- **Dashboard** - Overview with statistics and analytics
- **Ads Management** - Car listing management with status tracking
- **Payments** - Payment processing and tracking
- **Car Requests** - Customer vehicle requests
- **Dealers** - Dealer management and statistics
- **Users** - User and customer management
- **Finance** - Income and expense tracking
- **Social Media** - Social media post management
- **Support Tickets** - Customer support system
- **Notifications** - System notifications
- **Settings** - Platform configuration

### Database Features
- Automatic timestamp updates
- Auto-generated ticket numbers
- Payment-triggered ad activation
- Comprehensive indexing
- Activity logging
- Trigger-based automation

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and create database:

```bash
# Create database
psql -U postgres
CREATE DATABASE car_platform;
\q

# Run migration
psql -U postgres -d car_platform -f database/migrations/complete_system_schema.sql
```

See `database/README.md` for more details.

### 2. Backend Setup

```bash
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=car_platform
# DB_USER=postgres
# DB_PASSWORD=your_password

# Start backend server
npm run dev
```

Backend runs on http://localhost:3001

See `server/README.md` for complete API documentation.

### 3. Frontend Setup

```bash
# From project root
npm install

# Configure environment (optional)
cp .env.example .env
# Default API URL is http://localhost:3001/api

# Start frontend development server
npm run dev
```

Frontend runs on http://localhost:5173

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- PostgreSQL
- node-postgres (pg)
- CORS
- dotenv

## Database Schema

### Tables
1. **ads** - Car listings with auto-activation on payment
2. **payments** - Payment tracking with status management
3. **car_requests** - Customer vehicle requests
4. **dealers** - Dealer profiles and statistics
5. **users** - User and customer management
6. **finance_records** - Income and expense tracking
7. **social_media_posts** - Social media integration
8. **support_tickets** - Support ticket system with auto-numbering
9. **notifications** - User notifications
10. **settings** - System configuration
11. **activities** - Activity logging

## Development

```bash
# Frontend development
npm run dev

# Frontend build
npm run build

# Frontend type checking
npm run typecheck

# Backend development
cd server
npm run dev

# Backend production
cd server
npm start
```

## Production Deployment

1. Build frontend:
```bash
npm run build
```

2. Configure PostgreSQL database with production credentials

3. Update environment variables in `server/.env`

4. Start backend server:
```bash
cd server
npm start
```

5. Serve frontend build files from `dist/` directory

## API Documentation

Complete API documentation available in `server/README.md`

All endpoints are RESTful and support:
- GET for retrieval
- POST for creation
- PUT for updates
- DELETE for removal

Base URL: `http://localhost:3001/api`

## System Status

- Clean installation with empty database
- All CRUD operations ready
- No demo data included
- Production-ready configuration
