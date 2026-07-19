#!/bin/sh
# Substitute variable and save to a file the nginx user can read
envsubst '${BACKEND_URL}' < /tmp/nginx.conf.template > /tmp/nginx.conf
# Start Nginx using the generated config
nginx -c /tmp/nginx.conf -g 'daemon off;'