#!/bin/sh

MAX_RETRIES=5
RETRY_DELAY=1

echo "Starting migration retry script..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i of $MAX_RETRIES: Running migrations..."
  
  if npm run typeorm:migrations; then
    echo "✓ Migrations completed successfully"
    exit 0
  fi
  
  EXIT_CODE=$?
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "✗ Migration failed with exit code $EXIT_CODE, retrying in ${RETRY_DELAY}s..."
    sleep $RETRY_DELAY
    RETRY_DELAY=$((RETRY_DELAY * 2))
  else
    echo "✗ Migrations failed after $MAX_RETRIES attempts with exit code $EXIT_CODE"
  fi
done

exit 1
