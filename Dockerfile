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

# Install mongo_crypt_shared (required for Lab 1 CSFLE and Lab 2 Queryable Encryption)
# Replaces mongocryptd; enables automatic encryption without a separate process.
# amd64: debian12 tarball exists. arm64: only amazon2023 is published, use it (glibc-compatible with bookworm).
ARG TARGETARCH
ENV CRYPT_SHARED_VERSION=8.2.5
RUN case "$TARGETARCH" in \
    "amd64") CRYPT_ARCH="x86_64"; CRYPT_DISTRO="debian12" ;; \
    "arm64") CRYPT_ARCH="aarch64"; CRYPT_DISTRO="amazon2023" ;; \
    *) CRYPT_ARCH="x86_64"; CRYPT_DISTRO="debian12" ;; \
    esac \
    && curl -sSL "https://downloads.mongodb.com/linux/mongo_crypt_shared_v1-linux-${CRYPT_ARCH}-enterprise-${CRYPT_DISTRO}-${CRYPT_SHARED_VERSION}.tgz" -o /tmp/crypt_shared.tgz \
    && tar -xzf /tmp/crypt_shared.tgz -C /tmp \
    && cp "$(find /tmp -name 'mongo_crypt_v1.so' 2>/dev/null | head -1)" /usr/lib/ \
    && rm -rf /tmp/crypt_shared.tgz /tmp/mongo_crypt_shared_v1-*

# Optional: Azure CLI and Google Cloud SDK for multi-cloud verification (allow failure on low disk / I/O errors)
RUN apt-get update && (apt-get install -y --no-install-recommends azure-cli || true) && rm -rf /var/lib/apt/lists/*
RUN curl -sL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list \
    && (apt-get update && apt-get install -y --no-install-recommends google-cloud-cli || true) \
    && rm -rf /var/lib/apt/lists/*

# Workshop config: target cloud (aws | azure | gcp) and container mode
ENV WORKSHOP_CLOUD=aws
ENV WORKSHOP_RUNNING_IN_CONTAINER=true

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application source. To force image to include latest code, build with:
#   docker build --build-arg CACHEBUST=$(date +%s) -t ...
# or: docker build --no-cache -t ...
ARG CACHEBUST
COPY . .

EXPOSE 8080

# Start the workshop app (Vite dev server with verification APIs)
# --host 0.0.0.0 so the server is reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
