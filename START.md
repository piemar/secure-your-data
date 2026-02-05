# Starting the Application

## Quick Start (Development)

### Option 1: Start Dev Server Only (Uses Atlas MongoDB)

```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
npm run dev
```

The application will start on **http://localhost:8080** (or next available port).

**Note**: You'll need to provide a MongoDB Atlas connection string when setting up the labs.

---

### Option 2: Start with Local MongoDB (Docker)

If you want to use local MongoDB in Docker:

```bash
# Terminal 1: Start Docker services (MongoDB)
cd /Users/pierre.petersson/csfle-new/secure-your-data
docker-compose up -d mongo

# Terminal 2: Start dev server
cd /Users/pierre.petersson/csfle-new/secure-your-data
npm run dev
```

**Local MongoDB Connection**: `mongodb://mongo:27017` (when using Docker) or `mongodb://localhost:27017` (when connecting from host)

---

## Full Docker Setup (Optional)

To run everything in Docker:

```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
docker-compose up
```

This starts both the app and MongoDB in containers.

---

## Stopping the Application

### Stop Dev Server
Press `Ctrl+C` in the terminal running `npm run dev`

Or kill the process:
```bash
pkill -f "vite"
```

### Stop Docker Services
```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
docker-compose down
```

### Stop Everything
```bash
cd /Users/pierre.petersson/csfle-new/secure-your-data
pkill -f "vite"
docker-compose down
```

---

## Ports Used

- **8080** (or next available): Vite dev server
- **27017**: MongoDB (if using Docker)

---

## Prerequisites

- Node.js 18+ and npm installed
- MongoDB Atlas account (recommended) OR Docker for local MongoDB
- AWS account with KMS access (for labs)

---

## Troubleshooting

### Port Already in Use
If port 8080 is in use, Vite will automatically try the next available port (8081, 8082, etc.)

### Docker Not Running
If Docker isn't running, you can still use the app with MongoDB Atlas. Just provide your Atlas connection string in the lab setup wizard.

### MongoDB Connection Issues
- **Atlas**: Ensure your IP is whitelisted and connection string is correct
- **Local Docker**: Ensure `docker-compose up -d mongo` is running
