# Getting Started with DevRamp AI

Welcome to DevRamp AI! This guide will help you set up the project locally.

## Prerequisites
- Node.js v18+
- Python 3.10+
- PostgreSQL
- Docker (optional but recommended)
- IBM Bob API Key

## Quick Setup
The easiest way to get started is by running the setup script on Windows:
```powershell
.\setup.ps1
```

If you prefer to run things manually:

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "IBM Hackathon"
   ```

2. **Setup environment variables:**
   Copy `.env.example` to `.env` and fill in your IBM Bob API key and database credentials.

3. **Start the database:**
   ```bash
   docker-compose up postgres redis -d
   ```

4. **Install and start all services:**
   ```bash
   docker-compose up --build
   ```

## Services
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **IBM Bob Service**: http://localhost:8000
