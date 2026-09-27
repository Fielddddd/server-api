# Drone Monitoring API

An Express.js REST API for drone telemetry — logs temperature readings and serves per-drone configuration and status.

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/log` | Log a temperature reading (`drone_id`, `celsius`, `country`, `drone_name`) |
| GET | `/logs` | Fetch all logged temperature readings |
| GET | `/configs` | Fetch configuration for all drones (`max_speed` clamped between 100–110) |
| GET | `/configs/:id` | Fetch configuration for a single drone by `drone_id` |
| GET | `/status/:id` | Fetch the current condition for a single drone by `drone_id` |

## Data sources

- Temperature logs are stored in a [PocketHost](https://pockethost.io/) (PocketBase) collection, `drone_logs`
- Drone configuration is read from a Google Apps Script endpoint backed by a Google Sheet

## Stack

Node.js, Express, node-fetch, cors

## Run locally

```bash
npm install
npm start
```

Server listens on `PORT` (defaults to 8000).
