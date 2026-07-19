#!/bin/sh

# 1. Substitute variables and create the config
envsubst '${PORT} ${BACKEND_URL}' < /tmp/nginx.conf.template > /tmp/default.conf

# 2. Check if Nginx config is valid
nginx -t -c /tmp/default.conf

if [ $? -eq 0 ]; then
    # 3. Start Nginx
    exec nginx -c /tmp/default.conf -g 'daemon off;'
else
    echo "Nginx configuration test failed!"
    exit 1
fi