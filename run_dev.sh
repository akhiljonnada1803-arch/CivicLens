#!/usr/bin/env bash
# CivicLens AI - Development Runner (Bash)
set -e

echo "=========================================================="
echo "🚀 Starting CivicLens AI Full-Stack Development Environment"
echo "   Municipality: GVMC Ward 14 Operations Console"
echo "=========================================================="

export PYTHONPATH="backend"

# Trap to kill both on exit
trap 'kill 0' EXIT

echo "Starting FastAPI Backend on http://localhost:8001..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &

echo "Starting Operations Console on http://localhost:3000..."
(cd frontend && npm run dev) &

wait

