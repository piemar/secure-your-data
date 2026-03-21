# Terraform bootstrap

This directory contains a three-state Terraform layout:

- `live/control-plane`: persistent app stack
- `live/sandbox-base`: shared sandbox infrastructure
- `live/workshop`: one ephemeral stack per workshop id

The modules are intentionally minimal scaffolding so you can start planning safely and incrementally add resources.

## Quick start

```bash
scripts/aws/tf-init.sh control-plane
scripts/aws/deploy-control-plane.sh
scripts/aws/deploy-sandbox-base.sh
scripts/aws/create-workshop-stack.sh workshop-123 tenant-acme
scripts/aws/destroy-workshop-stack.sh workshop-123
```

