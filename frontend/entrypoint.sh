#!/bin/sh

echo "Starting Frontend..."
echo "BACKEND_URL is set to: $BACKEND_URL"

export PORT=${PORT:-80}

if [ -z "$BACKEND_URL" ]; then
    echo "WARNING: BACKEND_URL is empty! Nginx might fail."
fi

# Replace env vars in nginx.conf template
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx config generated:"
cat /etc/nginx/conf.d/default.conf

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
