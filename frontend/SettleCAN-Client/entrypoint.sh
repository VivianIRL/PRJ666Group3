#!/bin/sh
# Simply start Nginx with the static config
exec nginx -c /etc/nginx/nginx.conf -g 'daemon off; error_log /dev/stderr info;'