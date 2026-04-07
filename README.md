# excalibar

Excalidraw collaboration room server built with Bun and Socket.IO.

## Overview

- Drop-in replacement for the official `excalidraw-room`
- Built with Bun for fast startup and minimal footprint
- Configurable CORS origin via environment variable
- Versioned images published to GHCR

## Usage

Pull the image:

```
podman pull ghcr.io/neox5/excalibar:v1.0.0
```

Run:

```
podman run --rm -p 80:80 \
  -e CORS_ORIGIN=excalidraw.example.com \
  ghcr.io/neox5/excalibar:v1.0.0
```

## Configuration

| Variable      | Required | Default | Description                |
| ------------- | -------- | ------- | -------------------------- |
| `PORT`        | no       | `80`    | Port the server listens on |
| `CORS_ORIGIN` | no       | `*`     | Allowed origin for CORS    |

## Development

```
bun install
bun dev
```

## CI/CD

- Push tag `v*.*.*` → builds and publishes image to GHCR
- Pull requests → build only (no push)

## Related Components

- `excalidraw-build` — Excalidraw frontend image
- Caddy is used as reverse proxy in front of both services
