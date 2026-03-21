FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    jq \
    bash \
    nodejs \
    npm \
    golang-go \
    openjdk-17-jdk-headless \
    mono-devel \
    python3 \
    python3-pip \
    awscli \
    unzip \
    openssl \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Install mongosh from MongoDB apt repo.
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://pgp.mongodb.com/server-7.0.asc \
      | gpg --dearmor -o /etc/apt/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/etc/apt/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
      > /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends mongodb-mongosh \
    && rm -rf /var/lib/apt/lists/*

# Common workspace for bind-mounting workshop files.
WORKDIR /work

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bash"]

