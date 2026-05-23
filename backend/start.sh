#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
exec uvicorn server:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}"
