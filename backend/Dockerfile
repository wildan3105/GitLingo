# GitLingo Backend - Multi-stage Dockerfile

# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Distribution
FROM node:24-alpine AS distribution

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

# Health check: must be HTTP 200 AND JSON body must match:
# { ok: true, data: { services: { database: "ok", github: "ok" } } }
HEALTHCHECK --interval=15s --timeout=4s --start-period=10s --retries=10 \
  CMD node -e "\
    const u='http://127.0.0.1:3001/api/v1/health';\
    const ac=new AbortController();\
    const t=setTimeout(()=>ac.abort(),2500);\
    fetch(u,{signal:ac.signal}).then(async r=>{\
      if(r.status!==200) process.exit(1);\
      let j; try{ j=await r.json(); }catch{ process.exit(1); }\
      const ok = j && j.ok===true && j.data && j.data.services;\
      const s = ok ? j.data.services : {};\
      const good = ok && s.database==='ok' && s.github==='ok';\
      process.exit(good?0:1);\
    }).catch(()=>process.exit(1)).finally(()=>clearTimeout(t));\
  "

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]