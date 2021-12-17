#!/bin/bash
set -e

echo "Starting docker entrypoint…"

echo "Finished docker entrypoint."
exec "$@"
