# Phase 10: Deployment

## Overview
Prepare application for production deployment with proper configuration and documentation.

## Tasks

### 10.1 Setup environment variables
**Description:** Configure environment variables for different environments.

**Steps:**
- Create `.env.example` file
- Create `.env.development` file
- Create `.env.production` file
- Add environment variables to .gitignore
- Document all environment variables
- Add validation for required env vars

**Environment variables:**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SHARE=true

# Build Configuration
VITE_APP_VERSION=0.1.0
```

**Environment files:**
- `.env.example`: Template with all variables (checked into git)
- `.env.development`: Development config (not in git)
- `.env.production`: Production config (not in git)
- `.env.test`: Test config (optional)

**Acceptance Criteria:**
- ✅ All environment variables documented
- ✅ .env.example created
- ✅ Environment-specific configs created
- ✅ Validation added for required vars
- ✅ No secrets in git

---

### 10.2 Create production build configuration
**Description:** Optimize Vite configuration for production builds.

**Steps:**
- Review vite.config.ts
- Enable production optimizations
- Configure build output directory
- Enable source maps (for debugging)
- Configure asset optimization
- Set correct base URL
- Test production build locally

**Production optimizations:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```

**Acceptance Criteria:**
- ✅ Production build optimized
- ✅ Source maps generated
- ✅ Console logs removed in production
- ✅ Chunks split appropriately
- ✅ Build completes without errors
- ✅ Production build tested locally

---

### 10.3 Create Dockerfile for frontend
**Description:** Create optimized Dockerfile for frontend deployment.

**Steps:**
- Create `frontend/Dockerfile`
- Use multi-stage build
- Use nginx for serving static files
- Copy built files to nginx
- Configure nginx for SPA routing
- Add healthcheck
- Test Docker build and run locally

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf for SPA:**
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Health check endpoint
  location /health {
    access_log off;
    return 200 "OK";
    add_header Content-Type text/plain;
  }

  # SPA routing - fallback to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Acceptance Criteria:**
- ✅ Dockerfile builds successfully
- ✅ Multi-stage build reduces image size
- ✅ nginx serves static files correctly
- ✅ SPA routing works (no 404 on refresh)
- ✅ Healthcheck endpoint works
- ✅ Static assets cached appropriately

---

### 10.4 Create .dockerignore file
**Description:** Optimize Docker build by excluding unnecessary files.

**Steps:**
- Create `frontend/.dockerignore`
- Exclude node_modules
- Exclude dist
- Exclude .env files
- Exclude test files
- Exclude git files
- Test build size reduction

**frontend/.dockerignore:**
```
node_modules
dist
.git
.gitignore
.env*
*.md
.vscode
.idea
coverage
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
```

**Acceptance Criteria:**
- ✅ .dockerignore created
- ✅ Unnecessary files excluded
- ✅ Build context size reduced
- ✅ Build time improved
- ✅ No sensitive files in image

---

### 10.5 Test Docker build and run
**Description:** Build and test Docker image locally.

**Steps:**
- Build Docker image: `docker build -t gitlingo-frontend:latest .`
- Run container: `docker run -p 8080:80 gitlingo-frontend:latest`
- Test application in browser: `http://localhost:8080`
- Test health endpoint: `http://localhost:8080/health`
- Test SPA routing (refresh on a route)
- Test API connectivity
- Verify environment variables work

**Docker commands:**
```bash
# Build
cd frontend
docker build -t gitlingo-frontend:latest .

# Run with environment variables
docker run -d \
  -p 8080:80 \
  --name gitlingo-frontend \
  gitlingo-frontend:latest

# Check logs
docker logs gitlingo-frontend

# Stop and remove
docker stop gitlingo-frontend
docker rm gitlingo-frontend
```

**Acceptance Criteria:**
- ✅ Docker image builds successfully
- ✅ Container runs without errors
- ✅ Application accessible on port 8080
- ✅ Health endpoint returns 200
- ✅ SPA routing works in Docker
- ✅ API calls work (to backend)
- ✅ No console errors

---

### 10.6 Create frontend README
**Description:** Document frontend setup, development, and deployment.

**Steps:**
- Create `frontend/README.md`
- Document tech stack
- Document project structure
- Document setup instructions
- Document development workflow
- Document testing
- Document build and deployment
- Document environment variables
- Add troubleshooting section

**README sections:**
- Overview
- Tech Stack
- Prerequisites
- Getting Started
- Development
- Testing
- Building
- Deployment (Docker)
- Environment Variables
- Project Structure
- Contributing
- Troubleshooting

**Acceptance Criteria:**
- ✅ README is comprehensive
- ✅ Setup instructions are clear
- ✅ All commands documented
- ✅ Environment variables explained
- ✅ Troubleshooting section added
- ✅ Links to main docs included

---

### 10.7 Update root README with frontend info
**Description:** Update project root README with frontend information.

**Steps:**
- Update tech stack section
- Add frontend setup instructions
- Update project structure
- Add frontend development commands
- Update deployment instructions
- Add frontend-specific troubleshooting
- Keep backend documentation intact

**Sections to update:**
- Tech Stack (add React, Vite, Chart.js)
- Project Structure (add /frontend)
- Getting Started (add frontend setup)
- Development (add frontend dev commands)
- Docker (add frontend Docker commands)
- Architecture (link to frontend-spec.md)

**Acceptance Criteria:**
- ✅ Root README updated
- ✅ Frontend information added
- ✅ Backend information intact
- ✅ Instructions are clear
- ✅ Links to specs added
- ✅ Commands are accurate

---

### 10.8 Final deployment testing
**Description:** End-to-end testing of deployed application.

**Steps:**
- Build both frontend and backend Docker images
- Run both containers with docker-compose (optional)
- Test complete user flows
- Test on multiple browsers
- Test on mobile devices
- Test error scenarios
- Verify performance
- Document any issues

**Docker compose setup (optional):**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:3001
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

**Test scenarios:**
- ✅ Search for user → success
- ✅ Search for non-existent user → error
- ✅ Switch chart types
- ✅ Download chart
- ✅ Share to social media
- ✅ Test on Chrome, Firefox, Safari
- ✅ Test on mobile devices
- ✅ Test error recovery

**Acceptance Criteria:**
- ✅ Both services run in Docker
- ✅ Frontend connects to backend
- ✅ All user flows work end-to-end
- ✅ No errors in browser console
- ✅ Performance is acceptable
- ✅ Works on all tested browsers/devices
- ✅ Ready for production deployment

---

## Definition of Done
- [ ] All 8 tasks completed
- [ ] Environment variables configured
- [ ] Production build optimized
- [ ] Dockerfile created and tested
- [ ] Docker image runs successfully
- [ ] Frontend README comprehensive
- [ ] Root README updated
- [ ] End-to-end deployment tested
- [ ] Application ready for production

## Dependencies
- Phase 9 (Performance & Polish) must be complete
- Backend deployment should be ready

## Estimated Effort
4-5 hours

## Notes
- Test Docker builds on different platforms (Mac, Linux, Windows)
- Consider setting up CI/CD pipelines (GitHub Actions)
- Document any production-specific configuration
- Consider adding monitoring and error tracking (Sentry, etc.)
- Keep sensitive data out of git (use secrets management)
- Document any known issues or limitations
- Plan for future deployment (Vercel, Netlify, AWS, etc.)
