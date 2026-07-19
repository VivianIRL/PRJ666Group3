# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Skip git hooks
RUN HUSKY=0 npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the new hardcoded config
COPY nginx.conf /etc/nginx/nginx.conf

# Set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nginx
EXPOSE 8080
CMD ["/entrypoint.sh"]