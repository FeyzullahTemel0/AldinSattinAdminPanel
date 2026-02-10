# Backend Server - PostgreSQL API

Express.js backend with PostgreSQL database for car listing platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure database connection:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. Create database and run migrations:
```bash
# Create database
psql -U postgres
CREATE DATABASE car_platform;
\q

# Run the complete migration file
psql -U postgres -d car_platform -f ../database/migrations/complete_system_schema.sql
```

4. Start server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:3001

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-ads?limit=5` - Get recent ads
- `GET /api/dashboard/recent-requests?limit=4` - Get recent car requests
- `GET /api/dashboard/top-dealers?limit=5` - Get top dealers
- `GET /api/dashboard/category-distribution` - Get category distribution
- `GET /api/dashboard/activities?limit=10` - Get recent activities
- `POST /api/dashboard/activities` - Create activity log

### Ads
- `GET /api/ads` - Get all ads (supports ?status=... and ?search=... query params)
- `GET /api/ads/:id` - Get single ad
- `POST /api/ads` - Create new ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

### Payments
- `GET /api/payments` - Get all payments (supports ?ad_id=..., ?dealer_id=..., ?status=... query params)
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Car Requests
- `GET /api/car-requests` - Get all car requests (supports ?status=... and ?search=... query params)
- `GET /api/car-requests/:id` - Get single car request
- `POST /api/car-requests` - Create new car request
- `PUT /api/car-requests/:id` - Update car request
- `DELETE /api/car-requests/:id` - Delete car request

### Dealers
- `GET /api/dealers` - Get all dealers (supports ?status=... and ?search=... query params)
- `GET /api/dealers/:id` - Get single dealer
- `POST /api/dealers` - Create new dealer
- `PUT /api/dealers/:id` - Update dealer
- `DELETE /api/dealers/:id` - Delete dealer

### Users
- `GET /api/users` - Get all users (supports ?role=..., ?status=..., ?search=... query params)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Finance
- `GET /api/finance` - Get all finance records (supports ?type=..., ?category=..., ?start_date=..., ?end_date=... query params)
- `GET /api/finance/summary` - Get finance summary (supports ?start_date=..., ?end_date=... query params)
- `GET /api/finance/:id` - Get single finance record
- `POST /api/finance` - Create new finance record
- `PUT /api/finance/:id` - Update finance record
- `DELETE /api/finance/:id` - Delete finance record

### Social Media
- `GET /api/social-media` - Get all social media posts (supports ?platform=..., ?status=..., ?ad_id=... query params)
- `GET /api/social-media/:id` - Get single post
- `POST /api/social-media` - Create new post
- `PUT /api/social-media/:id` - Update post
- `DELETE /api/social-media/:id` - Delete post

### Support Tickets
- `GET /api/support-tickets` - Get all support tickets (supports ?status=..., ?priority=..., ?category=..., ?search=... query params)
- `GET /api/support-tickets/:id` - Get single ticket
- `POST /api/support-tickets` - Create new ticket
- `PUT /api/support-tickets/:id` - Update ticket
- `DELETE /api/support-tickets/:id` - Delete ticket

### Notifications
- `GET /api/notifications` - Get all notifications (supports ?user_id=..., ?is_read=..., ?type=... query params)
- `GET /api/notifications/:id` - Get single notification
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id` - Mark notification as read
- `PUT /api/notifications/mark-all-read/:user_id` - Mark all user notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Settings
- `GET /api/settings` - Get all settings (supports ?category=... query param)
- `GET /api/settings/:key` - Get setting by key
- `POST /api/settings` - Create or update setting
- `PUT /api/settings/:key` - Update setting
- `DELETE /api/settings/:key` - Delete setting

### Health Check
- `GET /api/health` - Check if server is running

## Database Features

- Automatic timestamp updates (updated_at)
- Auto-generate ticket numbers for support tickets
- Automatic ad activation on payment completion
- Comprehensive indexing for performance
- Activity logging system
- Category-based settings management
