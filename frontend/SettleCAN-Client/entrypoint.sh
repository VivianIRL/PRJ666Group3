#!/bin/sh

# Use envsubst to replace variables and output to /tmp/nginx.conf
# We must explicitly list the variables to prevent envsubst from 
# replacing other special Nginx characters like $uri or $host
envsubst '${PORT} ${BACKEND_URL}' < /tmp/nginx.conf.template > /tmp/nginx.conf

# Start Nginx using the generated config file
# Ensure the nginx user has read access to /tmp/nginx.conf
exec nginx -c /tmp/nginx.conf -g 'daemon off;'