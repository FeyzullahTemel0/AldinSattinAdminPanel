# Database Setup

## PostgreSQL Installation

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE car_platform;

# Exit
\q
```

## Run Migration

```bash
# Run the migration file
psql -U postgres -d car_platform -f migrations/create_ads_and_payments_system.sql
```

## Verify Installation

```bash
# Connect to database
psql -U postgres -d car_platform

# List tables
\dt

# You should see:
# - ads
# - payments

# Check ads table structure
\d ads

# Check payments table structure
\d payments

# Exit
\q
```

## Default Configuration

- Host: localhost
- Port: 5432
- Database: car_platform
- User: postgres
- Password: postgres (change this in production)

Update these values in `server/.env` file.
