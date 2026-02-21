# MongoDB CSFLE & QE Workshop - runs on linux/amd64 and linux/arm64 (Mac & Windows via Docker Desktop)
FROM node:20-bookworm-slim

# Install tools for AWS CLI and mongosh
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2 (multi-arch: amd64 or aarch64)
ARG TARGETARCH
RUN case "$TARGETARCH" in \
    "amd64") AWS_ARCH="x86_64" ;; \
    "arm64") AWS_ARCH="aarch64" ;; \
    *) AWS_ARCH="x86_64" ;; \
    esac \
    && curl -sSL "https://awscli.amazonaws.com/awscli-exe-linux-${AWS_ARCH}.zip" -o /tmp/awscliv2.zip \
    && unzip -q /tmp/awscliv2.zip -d /tmp \
    && /tmp/aws/install \
    && rm -rf /tmp/awscliv2.zip /tmp/aws

# Add MongoDB repository and install mongosh
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends mongodb-mongosh \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application source
COPY . .

EXPOSE 8080

# Start the workshop app (Vite dev server with verification APIs)
# --host 0.0.0.0 so the server is reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
