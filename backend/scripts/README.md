# Backend Scripts

Utility scripts for managing the backend server.

## Available Scripts

### `restart.sh`

Properly restart the backend server by killing all existing processes and starting fresh.

**When to use:**
- After changing `.env` file
- After changing configuration files
- When you suspect zombie processes are running
- When the server isn't picking up changes

**Usage:**
```bash
./scripts/restart.sh
```

**What it does:**
1. Stops all running backend processes (tsx/node)
2. Force kills if needed
3. Cleans the dist folder
4. Starts a fresh dev server

**From project root:**
```bash
cd backend
./scripts/restart.sh
```

**Tip:** If you get "permission denied", make sure the script is executable:
```bash
chmod +x scripts/restart.sh
```
