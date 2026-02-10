# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Car Platform application.

## Prerequisites

- PostgreSQL 12 or higher installed
- Database user with CREATE privileges

## Quick Setup

### 1. Create Database

First, create a new database:

```bash
createdb car_platform
```

Or using psql:

```sql
CREATE DATABASE car_platform;
```

### 2. Run Schema Script

Execute the schema file to create all tables, indexes, triggers, and sample data:

```bash
psql -U postgres -d car_platform -f schema.sql
```

Or copy and paste the entire content of `schema.sql` into a PostgreSQL query tool.

### 3. Configure Environment Variables

Update your backend `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=car_platform
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

### 4. Verify Installation

Connect to the database and verify tables were created:

```bash
psql -U postgres -d car_platform
```

Then run:

```sql
\dt
```

You should see all the following tables:
- user_profiles
- dealers
- ads
- payments
- car_requests
- support_tickets
- finance_records
- settings
- ad_banners
- social_media_accounts
- security_logs
- activities

## Database Schema

### Main Tables

#### dealers
Stores dealer/gallery information with sales statistics.

#### ads
Car advertisement listings with status tracking.

#### car_requests
Customer requests for specific vehicles.

#### payments
Payment transactions for advertisements.

#### finance_records
Income and expense tracking.

#### activities
System activity logs.

#### support_tickets
Customer support and complaint management.

#### settings
Application configuration.

#### ad_banners
Website banner advertisements.

#### social_media_accounts
Social media platform integrations.

#### security_logs
Security and access logs.

#### user_profiles
User profile and preferences.

## Sample Data

The schema includes sample data for:
- 5 Dealers
- 5 Advertisements
- 4 Car Requests
- 8 Finance Records
- 5 Settings
- 5 Ad Banners
- 8 Social Media Accounts
- 5 Security Logs
- 8 Activities

## Troubleshooting

### Permission Denied
If you get permission errors, make sure your database user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE car_platform TO your_user;
```

### Connection Refused
Verify PostgreSQL is running:

```bash
sudo service postgresql status
```

### Schema Already Exists
If tables already exist, the script will skip them (uses `CREATE TABLE IF NOT EXISTS`). To start fresh:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then re-run the schema.sql file.
