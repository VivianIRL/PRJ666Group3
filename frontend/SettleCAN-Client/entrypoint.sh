#!/bin/sh
# Substitute the environment variable and start Nginx
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'