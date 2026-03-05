# Docker and lab troubleshooting

## "input/output error" when creating container (overlay2)

If you see:

```
Error response from daemon: mkdir /var/lib/docker/overlay2/...: input/output error
```

Docker’s local storage (overlay2) is failing—often due to disk space, a bad disk, or corrupted Docker data. Try in order:

1. **Free space and prune**  
   - Check disk space: `df -h` (Mac/Linux) or ensure your Mac has free space.  
   - Remove unused Docker data:  
     `docker system prune -a --volumes`  
     (Use `-f` to skip confirmation. This removes all unused images, containers, networks, and volumes.)

2. **Restart Docker**  
   - Quit Docker Desktop completely and start it again (or restart the Docker daemon on Linux).

3. **Retry**  
   - Run again: `docker compose up app --force-recreate` (or run `docker compose build --no-cache app` first if you need a fresh image).

4. **If it persists**  
   - On **Docker Desktop (Mac/Windows):** Reset or reinstall Docker Desktop, or use *Troubleshoot → Clean / Purge data* (or equivalent) to reset Docker’s VM storage.  
   - On **Linux:** Check disk health and filesystem (`dmesg`, `smartctl` if available); consider moving Docker’s data root or reinstalling Docker if the disk is faulty.

---

## Docker build: "At least one invalid signature was encountered"

When building the image you may see:

```
E: The repository '...' InRelease is not signed.
W: GPG error: ... At least one invalid signature was encountered.
```

The **recommended Docker flow in the README** (Step 1) already uses a no-cache build (`docker compose build --no-cache app` then `docker compose up app --force-recreate`), which avoids this issue. If you see the error after using an older or cached build:

1. **Use the two-step no-cache flow** from the README:
   ```bash
   docker compose build --no-cache app
   docker compose up app --force-recreate
   ```
   Or with plain Docker: `docker build -f Dockerfile.full --no-cache -t <your-image> .`

2. **Ensure host date/time is correct** – GPG signature verification can fail if the system clock is wrong (e.g. in a VM or container).

3. **Corporate proxy/firewall** – If you are behind a proxy or firewall that modifies package metadata or contents, signatures may not match. Use a direct connection or work with your IT team to allow unmodified access to the package repositories.

---

## "Alias not found" but I created the key in Step 1

If the lab reports that the KMS alias (e.g. `alias/mongodb-lab-key-<suffix>`) was not found even though you completed Step 1 (Create Customer Master Key):

1. **Re-authenticate with AWS:** Log out and run `aws sso login` again (or re-run your usual AWS credential setup).

2. **Restart the Docker container** (if you are running the lab in Docker), or refresh the browser so the app and any in-browser terminal use the updated credentials.

3. **In-browser terminal:** If you run commands inside the lab’s terminal, ensure that environment has valid AWS credentials (e.g. re-run SSO login in that environment or use the same profile the lab expects).
