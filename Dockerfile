# Thin image: uses your published base. For local dev without publishing, use Dockerfile.full in docker-compose instead.
FROM pierrepetersson/mongodb-workshop-sandbox:latest

WORKDIR /usr/src/app

# Install build deps for mongodb-client-encryption native addon (node-gyp). Debian/Ubuntu or Alpine.
RUN (command -v apt-get >/dev/null 2>&1 && apt-get update -y && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*) || (command -v apk >/dev/null 2>&1 && apk add --no-cache python3 make g++) || true

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8080

# Rebuild mongodb-client-encryption native addon on startup (needed when node_modules comes from a volume that was populated without build tools).
CMD ["sh", "-c", "npm rebuild mongodb-client-encryption 2>/dev/null || true && exec npm run dev -- --host 0.0.0.0 --port 8080"]

