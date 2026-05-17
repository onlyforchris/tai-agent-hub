# TAI Agent Hub POC

TAI Agent Hub is a proof-of-concept demo for an enterprise Agent operations console. It focuses on the workflow for configuring finance/data-quality agents, reviewing reconciliation differences, and generating root-cause analysis reports.

The current repository is intentionally a POC: it provides a complete clickable experience and a small server-side analysis endpoint, while production data connectors are represented with deterministic mock data.

## What Is Implemented

- React + Vite front end for Agent configuration, model management, data integration, notifications, RBAC, and reconciliation analysis.
- Express server that serves the SPA and exposes demo APIs.
- `/api/differences` returns mock SAP/DMS reconciliation differences.
- `/api/analyze` performs server-side report generation through Gemini when `GEMINI_API_KEY` is configured, and falls back to a deterministic placeholder report when it is not.
- `/api/healthz` exposes service health and model-key readiness.
- `/api/poc-readiness` documents the current POC boundary for technical review.

## POC Boundary

The demo is suitable for explaining product workflow and target architecture. Before a customer pilot or production technical review, the following integrations should be implemented:

- Enterprise SSO and authoritative RBAC source.
- Read-only SAP/DMS/warehouse connectors.
- Model gateway with provider routing, audit logs, rate limits, and prompt/version governance.
- Ticketing or notification connector for workflow closure.
- Persistent storage for Agent configs, analysis sessions, and audit trails.

## Security Notes

- Model API keys are read only on the server from environment variables.
- Do not expose `GEMINI_API_KEY` through Vite client environment variables.
- Demo endpoints currently use mock business data and do not enforce authentication.
- Production deployment must add auth middleware, request audit logging, and connector-level least-privilege permissions.

## Run Locally

Prerequisite: Node.js 22+ is recommended.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional model configuration:

```bash
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-1.5-pro
```

Without `GEMINI_API_KEY`, the analysis endpoint returns a deterministic fallback report so the demo remains runnable offline.

## Build And Start

```bash
npm run build
npm start
```

`npm run build` runs TypeScript validation before creating the production bundle. The bundled server automatically runs in production/static mode when started from `dist/server.cjs`.

## Review Checklist

- `npm run lint`
- `npm run build`
- `npm start`
- `GET /api/healthz`
- `GET /api/poc-readiness`
